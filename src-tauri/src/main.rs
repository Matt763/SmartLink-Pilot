#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{Manager, ClipboardManager, CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem, SystemTrayEvent};
use std::time::Duration;

fn main() {
  let open = CustomMenuItem::new("open".to_string(), "Open SmartLink Pilot");
  let quit = CustomMenuItem::new("quit".to_string(), "Quit");
  let tray_menu = SystemTrayMenu::new()
    .add_item(open)
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(quit);

  let system_tray = SystemTray::new().with_menu(tray_menu);

  tauri::Builder::default()
    .setup(|app| {
      let handle = app.handle();
      
      // Spawn a background thread to poll the clipboard
      std::thread::spawn(move || {
        let mut last_content = String::new();
        loop {
          std::thread::sleep(Duration::from_millis(1000));
          
          if let Ok(clipboard_content) = handle.clipboard_manager().read_text() {
            if let Some(content) = clipboard_content {
              let trimmed = content.trim();
              if trimmed != last_content {
                last_content = trimmed.to_string();
                
                // If the user's copied clipboard exactly matches a standard URL prefix
                if trimmed.starts_with("http://") || trimmed.starts_with("https://") {
                  
                  // Emit event to the Web App so React can intercept
                  let _ = handle.emit_all("new-url-copied", trimmed.to_string());
                  
                  // Instantly raise the window to foreground overlay view
                  if let Some(window) = handle.get_window("main") {
                    let _ = window.show();
                    let _ = window.unminimize();
                    let _ = window.set_focus();
                  }
                }
              }
            }
          }
        }
      });
      Ok(())
    })
    .system_tray(system_tray)
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::MenuItemClick { id, .. } => {
        match id.as_str() {
          "quit" => {
            std::process::exit(0);
          }
          "open" => {
            let window = app.get_window("main").unwrap();
            window.show().unwrap();
            window.set_focus().unwrap();
          }
          _ => {}
        }
      }
      SystemTrayEvent::DoubleClick { .. } => {
        let window = app.get_window("main").unwrap();
        window.show().unwrap();
        window.set_focus().unwrap();
      }
      _ => {}
    })
    .on_window_event(|event| match event.event() {
        tauri::WindowEvent::CloseRequested { api, .. } => {
            // Prevent the window from actually closing. Instead hide it to system tray.
            event.window().hide().unwrap();
            api.prevent_close();
        }
        _ => {}
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
