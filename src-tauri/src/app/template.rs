use anyhow::Result;
use log::{error, info};
use std::{
  fs::{self, File},
  io::Write,
  path::Path,
};

pub static SCRIPT_MAIN: &[u8] = include_bytes!("../../../scripts/main.js");
pub static SCRIPT_CORE: &[u8] = include_bytes!("../../../scripts/core.js");
pub static SCRIPT_CHAT: &[u8] = include_bytes!("../../../scripts/chat.js");
pub static SCRIPT_CMD: &[u8] = include_bytes!("../../../scripts/cmd.js");
pub static SCRIPT_DALLE2: &[u8] = include_bytes!("../../../scripts/dalle2.js");
pub static SCRIPT_EXPORT: &[u8] = include_bytes!("../../../scripts/export.js");
pub static SCRIPT_MD_EXPORT: &[u8] = include_bytes!("../../../scripts/markdown.export.js");
pub static SCRIPT_POPUP_CORE: &[u8] = include_bytes!("../../../scripts/popup.core.js");
pub static SCRIPT_MANIFEST: &[u8] = include_bytes!("../../../scripts/manifest.json");
pub static SCRIPT_README: &[u8] = include_bytes!("../../../scripts/README.md");

#[derive(Debug)]
pub struct Template {
  pub main: Vec<u8>,
  pub core: Vec<u8>,
  pub chat: Vec<u8>,
  pub cmd: Vec<u8>,
  pub dalle2: Vec<u8>,
  pub export: Vec<u8>,
  pub markdown_export: Vec<u8>,
  pub popup_core: Vec<u8>,
  pub manifest: Vec<u8>,
  pub readme: Vec<u8>,
}

impl Template {
  pub fn new<P: AsRef<Path>>(template_dir: P) -> Self {
    let template_dir = template_dir.as_ref();
    let mut template = Template::default();

    {
      let files = vec![
        (template_dir.join("main.js"), &mut template.main),
        (template_dir.join("core.js"), &mut template.core),
        (template_dir.join("chat.js"), &mut template.chat),
        (template_dir.join("cmd.js"), &mut template.cmd),
        (template_dir.join("dalle2.js"), &mut template.dalle2),
        (template_dir.join("export.js"), &mut template.export),
        (
          template_dir.join("markdown.export.js"),
          &mut template.markdown_export,
        ),
        (template_dir.join("popup.core.js"), &mut template.popup_core),
        (template_dir.join("README.md"), &mut template.readme),
        (template_dir.join("manifest.json"), &mut template.manifest),
      ];

      for (filename, dest) in files {
        if !filename.exists() {
          match create_dir(&filename) {
            Ok(_) => {
              if let Err(e) = write_file_contents(&filename, dest) {
                error!("write_script, {}: {}", filename.display(), e);
              } else {
                info!("write_script: {}", filename.display());
              }
            }
            Err(e) => {
              error!("create_file, {}: {}", filename.display(), e);
            }
          }
        }
      }
    }

    template
  }
}

impl Default for Template {
  fn default() -> Template {
    Template {
      main: Vec::from(SCRIPT_MAIN),
      core: Vec::from(SCRIPT_CORE),
      chat: Vec::from(SCRIPT_CHAT),
      cmd: Vec::from(SCRIPT_CMD),
      dalle2: Vec::from(SCRIPT_DALLE2),
      export: Vec::from(SCRIPT_EXPORT),
      markdown_export: Vec::from(SCRIPT_MD_EXPORT),
      popup_core: Vec::from(SCRIPT_POPUP_CORE),
      manifest: Vec::from(SCRIPT_MANIFEST),
      readme: Vec::from(SCRIPT_README),
    }
  }
}

fn create_dir<P: AsRef<Path>>(filename: P) -> Result<()> {
  let filename = filename.as_ref();
  if let Some(parent) = filename.parent() {
    if !parent.exists() {
      fs::create_dir_all(parent)?;
    }
  }
  Ok(())
}

pub fn write_file_contents<P: AsRef<Path>>(filename: P, data: &[u8]) -> Result<()> {
  let filename = filename.as_ref();
  let mut file = File::create(filename)?;
  file.write_all(data)?;
  Ok(())
}
