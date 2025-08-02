# 📝 Electron Todo List App

Một ứng dụng desktop Todo List đơn giản được xây dựng với Electron.js, Electron Forge, Vite và TypeScript.

## ✨ Tính năng

- ➕ Thêm, sửa, xóa công việc
- ✅ Đánh dấu hoàn thành/chưa hoàn thành
- 🔍 Lọc công việc (Tất cả, Đang làm, Hoàn thành)
- 💾 Lưu trữ dữ liệu cục bộ
- 🎨 Giao diện đẹp với hiệu ứng gradient
- ⌨️ Hỗ trợ phím tắt
- 📱 Responsive design

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js >= 16.x
- npm hoặc yarn

### Cài đặt dependencies

```bash
npm install
```

### Chạy ứng dụng ở chế độ development

```bash
npm start
```

### Build ứng dụng

```bash
npm run make
```

### Các lệnh khác

```bash
# Lint code
npm run lint

# Package ứng dụng (không tạo installer)
npm run package
```

## 🏗️ Cấu trúc dự án

```
electron-todo-app/
├── src/
│   ├── main.ts              # Main process
│   ├── preload.ts           # Preload script
│   ├── renderer/
│   │   ├── index.html       # HTML chính
│   │   ├── styles.css       # CSS styling
│   │   └── renderer.ts      # Renderer logic
│   └── types/
│       └── global.d.ts      # Type declarations
├── forge.config.ts          # Electron Forge config
├── vite.*.config.ts         # Vite configurations
├── tsconfig.json           # TypeScript config
├── package.json            # Dependencies và scripts
└── README.md               # Documentation
```

## 🎮 Cách sử dụng

### Thêm công việc mới
1. Nhập nội dung công việc vào ô input
2. Nhấn "Add Task" hoặc Enter

### Quản lý công việc
- **Hoàn thành**: Click vào checkbox tròn bên trái
- **Sửa**: Click nút "Edit" hoặc double-click vào text
- **Xóa**: Click nút "Delete"

### Lọc công việc
- **All**: Hiển thị tất cả công việc
- **Active**: Chỉ hiển thị công việc chưa hoàn thành
- **Completed**: Chỉ hiển thị công việc đã hoàn thành

### Phím tắt
- `Ctrl/Cmd + 1`: Lọc tất cả
- `Ctrl/Cmd + 2`: Lọc đang làm
- `Ctrl/Cmd + 3`: Lọc hoàn thành
- `Enter`: Lưu khi đang chỉnh sửa
- `Escape`: Hủy chỉnh sửa

## 🛠️ Công nghệ sử dụng

- **Electron.js**: Framework để tạo ứng dụng desktop
- **Electron Forge**: Toolchain để package và distribute
- **Vite**: Build tool nhanh và hiện đại
- **TypeScript**: Ngôn ngữ lập trình có type safety
- **CSS3**: Styling với gradient và animations

## 💾 Lưu trữ dữ liệu

Ứng dụng lưu trữ dữ liệu trong file `todos.json` tại thư mục userData của hệ điều hành:

- **Windows**: `%APPDATA%/electron-todo-app/todos.json`
- **macOS**: `~/Library/Application Support/electron-todo-app/todos.json`
- **Linux**: `~/.config/electron-todo-app/todos.json`

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

## 🎯 Roadmap

- [ ] Dark/Light theme toggle
- [ ] Import/Export todos
- [ ] Drag & drop reordering
- [ ] Categories/Tags
- [ ] Search functionality
- [ ] Due dates và reminders
- [ ] Sync với cloud storage

## 📞 Liên hệ

Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào, hãy tạo issue trên GitHub repository.