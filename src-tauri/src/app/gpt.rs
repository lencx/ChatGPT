use crate::{
  app::{fs_extra, window},
  conf::GITHUB_PROMPTS_CSV_URL,
  utils,
};
use log::{error, info};
use regex::Regex;
use std::{collections::HashMap, fs, path::PathBuf, vec};
use tauri::{api, command, AppHandle, Manager};
use walkdir::WalkDir;

use super::fs_extra::Error;

#[command]
pub fn get_chat_prompt_cmd() -> serde_json::Value {
  let path = utils::app_root().join("chat.prompt.cmd.json");
  let content = fs::read_to_string(path).unwrap_or_else(|_| r#"{"data":[]}"#.to_string());
  serde_json::from_str(&content).unwrap()
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PromptBaseRecord {
  pub cmd: Option<String>,
  pub act: String,
  pub prompt: String,
}

#[command]
pub fn parse_prompt(data: String) -> Option<Vec<PromptBaseRecord>> {
  let mut rdr = csv::Reader::from_reader(data.as_bytes());
  let mut list = vec![];

  for result in rdr.deserialize::<PromptBaseRecord>() {
    match result {
      Ok(record) => {
        if !record.act.is_empty() {
          list.push(record);
        }
      }
      Err(err) => {
        error!("parse_prompt: {}", err);
      }
    }
  }

  if list.is_empty() {
    None
  } else {
    Some(list)
  }
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct PromptRecord {
  pub cmd: String,
  pub act: String,
  pub prompt: String,
  pub tags: Vec<String>,
  pub enable: bool,
}

#[command]
pub fn cmd_list() -> Vec<PromptRecord> {
  let mut list = vec![];
  for entry in WalkDir::new(utils::app_root().join("cache_prompts"))
    .into_iter()
    .filter_map(|e| e.ok())
  {
    let file = fs::read_to_string(entry.path().display().to_string());
    if let Ok(v) = file {
      let data: Vec<PromptRecord> = serde_json::from_str(&v).unwrap_or_else(|_| vec![]);
      let enable_list = data.into_iter().filter(|v| v.enable);
      list.extend(enable_list)
    }
  }
  // dbg!(&list);
  list.sort_by(|a, b| a.cmd.len().cmp(&b.cmd.len()));
  list
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct FileMetadata {
  pub name: String,
  pub ext: String,
  pub created: u64,
  pub id: String,
}

#[tauri::command]
pub fn get_download_list(pathname: &str) -> (Vec<serde_json::Value>, PathBuf) {
  info!("get_download_list: {}", pathname);
  let download_path = utils::app_root().join(PathBuf::from(pathname));
  let content = fs::read_to_string(&download_path).unwrap_or_else(|err| {
    error!("download_list: {}", err);
    fs::write(&download_path, "[]").unwrap();
    "[]".to_string()
  });
  let list = serde_json::from_str::<Vec<serde_json::Value>>(&content).unwrap_or_else(|err| {
    error!("download_list_parse: {}", err);
    vec![]
  });

  (list, download_path)
}

#[command]
pub fn download_list(pathname: &str, dir: &str, filename: Option<String>, id: Option<String>) {
  info!("download_list: {}", pathname);
  let data = get_download_list(pathname);
  let mut list = vec![];
  let mut idmap = HashMap::new();
  utils::vec_to_hashmap(data.0.into_iter(), "id", &mut idmap);

  for entry in WalkDir::new(utils::app_root().join(dir))
    .into_iter()
    .filter_entry(|e| !utils::is_hidden(e))
    .filter_map(|e| e.ok())
  {
    let metadata = entry.metadata().unwrap();
    if metadata.is_file() {
      let file_path = entry.path().display().to_string();
      let re = Regex::new(r"(?P<id>[\d\w]+).(?P<ext>\w+)$").unwrap();
      let caps = re.captures(&file_path).unwrap();
      let fid = &caps["id"];
      let fext = &caps["ext"];

      let mut file_data = FileMetadata {
        name: fid.to_string(),
        id: fid.to_string(),
        ext: fext.to_string(),
        created: fs_extra::system_time_to_ms(metadata.created()),
      };

      if idmap.get(fid).is_some() {
        let name = idmap.get(fid).unwrap().get("name").unwrap().clone();
        match name {
          serde_json::Value::String(v) => {
            file_data.name = v.clone();
            v
          }
          _ => "".to_string(),
        };
      }

      if filename.is_some() && id.is_some() {
        if let Some(ref v) = id {
          if fid == v {
            if let Some(ref v2) = filename {
              file_data.name = v2.to_string();
            }
          }
        }
      }
      list.push(serde_json::to_value(file_data).unwrap());
    }
  }

  // dbg!(&list);
  list.sort_by(|a, b| {
    let a1 = a.get("created").unwrap().as_u64().unwrap();
    let b1 = b.get("created").unwrap().as_u64().unwrap();
    a1.cmp(&b1).reverse()
  });

  fs::write(data.1, serde_json::to_string_pretty(&list).unwrap()).unwrap();
}

#[command]
pub async fn sync_prompts(app: AppHandle, time: u64) -> Option<Vec<PromptRecord>> {
  let res = utils::get_data(GITHUB_PROMPTS_CSV_URL, Some(&app))
    .await
    .unwrap();

  if let Some(v) = res {
    if let Some(data) = parse_prompt(v) {
      let transformed_data = data
        .iter()
        .map(|i| PromptRecord {
          cmd: if let Some(cmd) = &i.cmd {
            cmd.clone()
          } else {
            utils::gen_cmd(i.act.clone())
          },
          act: i.act.clone(),
          prompt: i.prompt.clone(),
          tags: vec!["chatgpt-prompts".to_string()],
          enable: true,
        })
        .collect::<Vec<PromptRecord>>();

      let data2 = transformed_data;

      let prompts = utils::app_root().join("chat.prompt.json");
      let prompt_cmd = utils::app_root().join("chat.prompt.cmd.json");
      let chatgpt_prompts = utils::app_root()
        .join("cache_prompts")
        .join("chatgpt_prompts.json");

      if !utils::exists(&prompts) {
        fs::write(
          &prompts,
          serde_json::json!({
            "name": "ChatGPT Prompts",
            "link": "https://github.com/lencx/ChatGPT"
          })
          .to_string(),
        )
        .unwrap();
      }

      // chatgpt_prompts.json
      fs::write(
        chatgpt_prompts,
        serde_json::to_string_pretty(&data).unwrap(),
      )
      .unwrap();
      let cmd_data = cmd_list();

      // chat.prompt.cmd.json
      fs::write(
        prompt_cmd,
        serde_json::to_string_pretty(&serde_json::json!({
          "name": "ChatGPT CMD",
          "last_updated": time,
          "data": cmd_data,
        }))
        .unwrap(),
      )
      .unwrap();
      let mut kv = HashMap::new();
      kv.insert(
        "sync_prompts".to_string(),
        serde_json::json!({ "id": "chatgpt_prompts", "last_updated": time }),
      );
      let prompts_data = utils::merge(
        &serde_json::from_str(&fs::read_to_string(&prompts).unwrap()).unwrap(),
        &kv,
      );

      // chat.prompt.json
      fs::write(
        prompts,
        serde_json::to_string_pretty(&prompts_data).unwrap(),
      )
      .unwrap();

      // refresh window
      api::dialog::message(
        app.get_window("core").as_ref(),
        "Sync Prompts",
        "Prompts data has been synchronized!",
      );
      window::cmd::window_reload(app.clone(), "core");
      window::cmd::window_reload(app, "tray");

      return Some(data2);
    }
  }

  None
}

#[command]
pub async fn sync_user_prompts(url: String, data_type: String) -> Option<Vec<PromptRecord>> {
  info!("sync_user_prompts: url => {}", url);
  let res = utils::get_data(&url, None).await.unwrap_or_else(|err| {
    error!("chatgpt_http: {}", err);
    None
  });

  if let Some(v) = res {
    let data: Option<Vec<PromptBaseRecord>> = if data_type == "csv" {
      info!("chatgpt_http_csv_parse");
      parse_prompt(v)
    } else if data_type == "json" {
      info!("chatgpt_http_json_parse");
      match serde_json::from_str::<Vec<PromptBaseRecord>>(&v) {
        Ok(parsed) => Some(parsed),
        Err(err) => {
          error!("chatgpt_http_json_parse: {}", err);
          None
        }
      }
    } else {
      error!("chatgpt_http_unknown_type");
      None
    };

    if let Some(base_records) = data {
      let data = base_records
        .iter()
        .map(|i| PromptRecord {
          cmd: i
            .cmd
            .clone()
            .unwrap_or_else(|| utils::gen_cmd(i.act.clone())),
          act: i.act.clone(),
          prompt: i.prompt.clone(),
          tags: vec!["user-sync".to_string()],
          enable: true,
        })
        .collect::<Vec<PromptRecord>>();

      return Some(data);
    }
  }

  None
}
