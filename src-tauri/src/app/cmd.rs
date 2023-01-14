use crate::{
    app::{fs_extra, window},
    conf::{ChatConfJson, GITHUB_PROMPTS_CSV_URL},
    utils::{self, chat_root, create_file},
};
use log::info;
use regex::Regex;
use std::{collections::HashMap, fs, path::PathBuf, vec};
use tauri::{api, command, AppHandle, Manager, Theme};
use walkdir::WalkDir;

#[command]
pub fn drag_window(app: AppHandle) {
    app.get_window("core").unwrap().start_dragging().unwrap();
}

#[command]
pub fn dalle2_window(app: AppHandle, query: String) {
    window::dalle2_window(
        &app.app_handle(),
        Some(query),
        Some("ChatGPT & DALL·E 2".to_string()),
        None,
    );
}

#[command]
pub fn fullscreen(app: AppHandle) {
    let win = app.get_window("core").unwrap();
    if win.is_fullscreen().unwrap() {
        win.set_fullscreen(false).unwrap();
    } else {
        win.set_fullscreen(true).unwrap();
    }
}

#[command]
pub fn download(_app: AppHandle, name: String, blob: Vec<u8>) {
    let path = chat_root().join(PathBuf::from(name));
    create_file(&path).unwrap();
    fs::write(&path, blob).unwrap();
    utils::open_file(path);
}

#[command]
pub fn save_file(_app: AppHandle, name: String, content: String) {
    let path = chat_root().join(PathBuf::from(name));
    create_file(&path).unwrap();
    fs::write(&path, content).unwrap();
    utils::open_file(path);
}

#[command]
pub fn open_link(app: AppHandle, url: String) {
    api::shell::open(&app.shell_scope(), url, None).unwrap();
}

#[command]
pub fn get_chat_conf() -> ChatConfJson {
    ChatConfJson::get_chat_conf()
}

#[command]
pub fn get_theme() -> String {
    ChatConfJson::theme().unwrap_or(Theme::Light).to_string()
}

#[command]
pub fn reset_chat_conf() -> ChatConfJson {
    ChatConfJson::reset_chat_conf()
}

#[command]
pub fn run_check_update(app: AppHandle, silent: bool, has_msg: Option<bool>) {
    utils::run_check_update(app, silent, has_msg);
}

#[command]
pub fn form_confirm(_app: AppHandle, data: serde_json::Value) {
    ChatConfJson::amend(&serde_json::json!(data), None).unwrap();
}

#[command]
pub fn form_cancel(app: AppHandle, label: &str, title: &str, msg: &str) {
    let win = app.app_handle().get_window(label).unwrap();
    tauri::api::dialog::ask(
        app.app_handle().get_window(label).as_ref(),
        title,
        msg,
        move |is_cancel| {
            if is_cancel {
                win.close().unwrap();
            }
        },
    );
}

#[command]
pub fn form_msg(app: AppHandle, label: &str, title: &str, msg: &str) {
    let win = app.app_handle().get_window(label);
    tauri::api::dialog::message(win.as_ref(), title, msg);
}

#[command]
pub fn open_file(path: PathBuf) {
    utils::open_file(path);
}

#[command]
pub fn get_chat_model_cmd() -> serde_json::Value {
    let path = utils::chat_root().join("chat.model.cmd.json");
    let content = fs::read_to_string(path).unwrap_or_else(|_| r#"{"data":[]}"#.to_string());
    serde_json::from_str(&content).unwrap()
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PromptRecord {
    pub cmd: Option<String>,
    pub act: String,
    pub prompt: String,
}

#[command]
pub fn parse_prompt(data: String) -> Vec<PromptRecord> {
    let mut rdr = csv::Reader::from_reader(data.as_bytes());
    let mut list = vec![];
    for result in rdr.deserialize() {
        let record: PromptRecord = result.unwrap_or_else(|err| {
            info!("parse_prompt_error: {}", err);
            PromptRecord {
                cmd: None,
                act: "".to_string(),
                prompt: "".to_string(),
            }
        });
        if !record.act.is_empty() {
            list.push(record);
        }
    }
    list
}

#[command]
pub fn window_reload(app: AppHandle, label: &str) {
    app.app_handle()
        .get_window(label)
        .unwrap()
        .eval("window.location.reload()")
        .unwrap();
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct ModelRecord {
    pub cmd: String,
    pub act: String,
    pub prompt: String,
    pub tags: Vec<String>,
    pub enable: bool,
}

#[command]
pub fn cmd_list() -> Vec<ModelRecord> {
    let mut list = vec![];
    for entry in WalkDir::new(utils::chat_root().join("cache_model"))
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let file = fs::read_to_string(entry.path().display().to_string());
        if let Ok(v) = file {
            let data: Vec<ModelRecord> = serde_json::from_str(&v).unwrap_or_else(|_| vec![]);
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
    let download_path = chat_root().join(PathBuf::from(pathname));
    let content = fs::read_to_string(&download_path).unwrap_or_else(|err| {
        info!("download_list_error: {}", err);
        fs::write(&download_path, "[]").unwrap();
        "[]".to_string()
    });
    let list = serde_json::from_str::<Vec<serde_json::Value>>(&content).unwrap_or_else(|err| {
        info!("download_list_parse_error: {}", err);
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

    for entry in WalkDir::new(utils::chat_root().join(dir))
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
pub async fn sync_prompts(app: AppHandle, time: u64) -> Option<Vec<ModelRecord>> {
    let res = utils::get_data(GITHUB_PROMPTS_CSV_URL, Some(&app))
        .await
        .unwrap();

    if let Some(v) = res {
        let data = parse_prompt(v)
            .iter()
            .map(move |i| ModelRecord {
                cmd: if i.cmd.is_some() {
                    i.cmd.clone().unwrap()
                } else {
                    utils::gen_cmd(i.act.clone())
                },
                act: i.act.clone(),
                prompt: i.prompt.clone(),
                tags: vec!["chatgpt-prompts".to_string()],
                enable: true,
            })
            .collect::<Vec<ModelRecord>>();

        let data2 = data.clone();

        let model = utils::chat_root().join("chat.model.json");
        let model_cmd = utils::chat_root().join("chat.model.cmd.json");
        let chatgpt_prompts = utils::chat_root()
            .join("cache_model")
            .join("chatgpt_prompts.json");

        if !utils::exists(&model) {
            fs::write(
                &model,
                serde_json::json!({
                    "name": "ChatGPT Model",
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

        // chat.model.cmd.json
        fs::write(
            model_cmd,
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
        let model_data = utils::merge(
            &serde_json::from_str(&fs::read_to_string(&model).unwrap()).unwrap(),
            &kv,
        );

        // chat.model.json
        fs::write(model, serde_json::to_string_pretty(&model_data).unwrap()).unwrap();

        // refresh window
        api::dialog::message(
            app.get_window("core").as_ref(),
            "Sync Prompts",
            "ChatGPT Prompts data has been synchronized!",
        );
        window_reload(app.clone(), "core");
        window_reload(app, "tray");

        return Some(data2);
    }

    None
}

#[command]
pub async fn sync_user_prompts(url: String, data_type: String) -> Option<Vec<ModelRecord>> {
    let res = utils::get_data(&url, None).await.unwrap_or_else(|err| {
        info!("chatgpt_http_error: {}", err);
        None
    });

    info!("chatgpt_http_url: {}", url);

    if let Some(v) = res {
        let data;
        if data_type == "csv" {
            info!("chatgpt_http_csv_parse");
            data = parse_prompt(v);
        } else if data_type == "json" {
            info!("chatgpt_http_json_parse");
            data = serde_json::from_str(&v).unwrap_or_else(|err| {
                info!("chatgpt_http_json_parse_error: {}", err);
                vec![]
            });
        } else {
            info!("chatgpt_http_unknown_type");
            data = vec![];
        }

        let data = data
            .iter()
            .map(move |i| ModelRecord {
                cmd: if i.cmd.is_some() {
                    i.cmd.clone().unwrap()
                } else {
                    utils::gen_cmd(i.act.clone())
                },
                act: i.act.clone(),
                prompt: i.prompt.clone(),
                tags: vec!["user-sync".to_string()],
                enable: true,
            })
            .collect::<Vec<ModelRecord>>();

        return Some(data);
    }

    None
}
