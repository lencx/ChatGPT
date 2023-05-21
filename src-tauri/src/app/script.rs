use crate::utils::{app_root, exists};
use log::error;
use log::info;
use regex::Regex;
use serde_json::{from_str, json, Value};
use std::fs;
use tauri::Manager;

use crate::{conf::SCRIPTS_MANIFEST, window};

pub async fn init_script(app: tauri::AppHandle) -> anyhow::Result<(), reqwest::Error> {
  let body = reqwest::get(SCRIPTS_MANIFEST).await?.text().await?;

  if exist_scripts("manifest.json".into()) {
    let compare = compare_nested_json_objects(
      &fs::read_to_string(app_root().join("scripts").join("manifest.json")).unwrap(),
      &body,
    );
    if !compare {
      info!("update_scripts_manifest");
      create_chatgpt_scripts("manifest.json".into(), body);

      if let Some(v) = app.get_window("core") {
        tauri::api::dialog::ask(Some(&v), "Scripts Update", "There are new available scripts. Please go to 'Preferences -> Control Center -> Scripts' to check for updates.", |is_ok| {
          if is_ok {
            info!("update_scripts_manifest_ok");
            // TODO: goto scripts page
            window::cmd::control_window(app, "scripts".into())
          } else {
            info!("update_scripts_manifest_cancel");
          }
        });
      }
    }
  } else {
    create_chatgpt_scripts("manifest.json".into(), body);
  }

  Ok(())
}

pub fn parse_script(name: String) -> serde_json::Value {
  let code = &fs::read_to_string(name).unwrap();
  let re_name = Regex::new(r"@name\s+(.*?)\n").unwrap();
  let re_version = Regex::new(r"@version\s+(.*?)\n").unwrap();
  let re_url = Regex::new(r"@url\s+(.*?)\n").unwrap();

  let mut name = String::new();
  let mut version = String::new();
  let mut url = String::new();

  if let Some(capture) = re_name.captures(code) {
    name = capture.get(1).unwrap().as_str().trim().to_owned();
  }

  if let Some(capture) = re_version.captures(code) {
    version = capture.get(1).unwrap().as_str().trim().to_owned();
  }

  if let Some(capture) = re_url.captures(code) {
    url = capture.get(1).unwrap().as_str().trim().to_owned();
  }

  let json_data = json!({
      "name": name,
      "version": version,
      "url": url,
  });

  json_data
}

pub fn exist_scripts(file: String) -> bool {
  let script_file = app_root().join("scripts").join(file);
  exists(&script_file)
}

pub fn create_chatgpt_scripts(file: String, body: String) {
  let script_file = app_root().join("scripts").join(file);
  info!("script_file: {:?}", script_file);
  fs::write(&script_file, body).unwrap();
}

fn compare_nested_json_objects(json1: &str, json2: &str) -> bool {
  let value1: Value = from_str(json1).unwrap_or_else(|err| {
    error!("json_parse_1_error: {}", err);
    json!({})
  });
  let value2: Value = from_str(json2).unwrap_or_else(|err| {
    error!("json_parse_2_error: {}", err);
    json!({})
  });

  compare_json_objects(&value1, &value2)
}

pub fn compare_json_objects(obj1: &Value, obj2: &Value) -> bool {
  match (obj1, obj2) {
    (Value::Object(obj1), Value::Object(obj2)) => {
      if obj1.len() != obj2.len() {
        return false;
      }
      for (key, value) in obj1 {
        if !obj2.contains_key(key) || !compare_json_objects(value, obj2.get(key).unwrap()) {
          return false;
        }
      }
      true
    }
    (Value::Array(arr1), Value::Array(arr2)) => {
      if arr1.len() != arr2.len() {
        return false;
      }
      for (value1, value2) in arr1.iter().zip(arr2.iter()) {
        if !compare_json_objects(value1, value2) {
          return false;
        }
      }
      true
    }
    _ => obj1 == obj2,
  }
}
