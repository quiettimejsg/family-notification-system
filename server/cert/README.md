# SSL证书说明

本目录用于存放HTTPS所需的SSL证书文件。

## 生成自签名证书

如果没有商业SSL证书，可以使用OpenSSL生成自签名证书：

```bash
# 创建证书目录
mkdir -p server/cert

# 生成私钥
openssl genrsa -out server/cert/key.pem 2048

# 生成证书签名请求
openssl req -new -key server/cert/key.pem -out server/cert/csr.pem

# 生成自签名证书
openssl x509 -req -days 365 -in server/cert/csr.pem -signkey server/cert/key.pem -out server/cert/cert.pem

# 删除证书签名请求（可选）
rm server/cert/csr.pem
```

## 注意事项

- 自签名证书在浏览器中会显示安全警告，仅用于开发和测试环境
- 生产环境应使用受信任的CA颁发的SSL证书
- 确保key.pem和cert.pem文件存在于本目录中