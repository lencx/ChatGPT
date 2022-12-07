use tauri::Manager;

#[tauri::command]
pub fn drag_window(app: tauri::AppHandle) {
    app.get_window("core").unwrap().start_dragging().unwrap();
}

#[tauri::command]
pub fn fullscreen(app: tauri::AppHandle) {
    let win = app.get_window("core").unwrap();
    if win.is_fullscreen().unwrap() {
        win.set_fullscreen(false).unwrap();
    } else {
        win.set_fullscreen(true).unwrap();
    }
}
