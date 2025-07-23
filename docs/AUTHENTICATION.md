# Authentication Guide

Auto Form Filler hỗ trợ nhiều phương pháp authentication để xử lý các website yêu cầu đăng nhập trước khi có thể truy cập form.

## Các phương pháp Authentication

### 1. Manual Login (Đăng nhập thủ công)

**Cách sử dụng:**

-   Chọn tab "Manual" trong Authentication Manager
-   Điều chỉnh thời gian chờ sau khi đăng nhập (mặc định: 10 giây)
-   Khi chạy automation, browser sẽ mở và chờ bạn đăng nhập thủ công
-   Sau khi đăng nhập xong, automation sẽ tiếp tục tự động

**Ưu điểm:**

-   Đơn giản, không cần cấu hình phức tạp
-   Phù hợp với các website có captcha hoặc 2FA
-   An toàn, không lưu thông tin đăng nhập

**Nhược điểm:**

-   Cần can thiệp thủ công mỗi lần chạy
-   Không thể chạy hoàn toàn tự động

### 2. Credentials Login (Đăng nhập bằng tài khoản)

**Cách sử dụng:**

-   Chọn tab "Credentials" trong Authentication Manager
-   Nhập username và password
-   (Tùy chọn) Cấu hình selectors cho các trường đăng nhập:
    -   Username Field Selector: `input[name='username']`, `#username`, etc.
    -   Password Field Selector: `input[name='password']`, `#password`, etc.
    -   Submit Button Selector: `button[type='submit']`, `input[type='submit']`, etc.

**Ưu điểm:**

-   Hoàn toàn tự động
-   Không cần can thiệp thủ công
-   Có thể chạy batch với nhiều tài khoản

**Nhược điểm:**

-   Cần lưu thông tin đăng nhập (có thể không an toàn)
-   Không hoạt động với captcha hoặc 2FA
-   Có thể bị chặn bởi anti-bot

### 3. Cookies Authentication

**Cách sử dụng:**

-   Chọn tab "Cookies" trong Authentication Manager
-   Export cookies từ browser sau khi đăng nhập thành công
-   Paste cookies vào textarea (định dạng JSON)

**Cách export cookies:**

1. Mở Developer Tools (F12)
2. Vào tab Application/Storage
3. Chọn Cookies
4. Copy cookies cần thiết
5. Chuyển đổi sang định dạng JSON

**Ví dụ cookies:**

```json
[
    {
        "name": "sessionId",
        "value": "abc123",
        "domain": ".example.com",
        "path": "/"
    },
    {
        "name": "authToken",
        "value": "xyz789",
        "domain": ".example.com",
        "path": "/"
    }
]
```

**Ưu điểm:**

-   Không cần lưu username/password
-   Hoạt động với hầu hết website
-   Có thể tái sử dụng session

**Nhược điểm:**

-   Cookies có thể hết hạn
-   Cần export thủ công từ browser

### 4. Session Data Authentication

**Cách sử dụng:**

-   Chọn tab "Session" trong Authentication Manager
-   Export localStorage và sessionStorage từ browser
-   Paste vào textarea (định dạng JSON)

**Cách export session data:**

1. Mở Developer Tools (F12)
2. Vào tab Application/Storage
3. Chọn Local Storage hoặc Session Storage
4. Copy dữ liệu cần thiết

**Ví dụ session data:**

```json
{
    "localStorage": {
        "userToken": "abc123",
        "userId": "12345"
    },
    "sessionStorage": {
        "tempData": "xyz789"
    }
}
```

**Ưu điểm:**

-   Hỗ trợ các website sử dụng client-side storage
-   Có thể lưu trữ thông tin phức tạp

**Nhược điểm:**

-   Phức tạp hơn cookies
-   Không phổ biến bằng cookies

## Best Practices

### Bảo mật

-   Không lưu thông tin đăng nhập nhạy cảm trong config
-   Sử dụng environment variables cho production
-   Xóa cookies/session data sau khi sử dụng

### Selectors

-   Sử dụng selectors cụ thể và ổn định
-   Tránh sử dụng selectors dựa trên text content
-   Test selectors trước khi chạy automation

### Error Handling

-   Luôn có fallback cho trường hợp authentication thất bại
-   Log đầy đủ thông tin để debug
-   Có timeout hợp lý cho các bước authentication

### Performance

-   Sử dụng cookies/session data thay vì credentials khi có thể
-   Cache authentication data để tái sử dụng
-   Tránh đăng nhập lại không cần thiết

## Troubleshooting

### Authentication thất bại

1. Kiểm tra selectors có chính xác không
2. Xác nhận website không thay đổi cấu trúc
3. Kiểm tra cookies/session có hết hạn không
4. Thử phương pháp authentication khác

### Website chặn automation

1. Thêm delay giữa các thao tác
2. Sử dụng user-agent thực tế
3. Thêm random delays
4. Sử dụng proxy nếu cần

### Captcha/2FA

-   Sử dụng manual login mode
-   Hoặc tích hợp với captcha solving service
-   Cân nhắc sử dụng API thay vì web interface
