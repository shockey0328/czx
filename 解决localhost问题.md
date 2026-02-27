# 解决 localhost 无法访问的问题

## 问题现象
浏览器显示：`ERR_CONNECTION_REFUSED` - localhost 拒绝连接

## 原因分析
1. HTTP服务器未启动
2. 端口8000被占用或被防火墙阻止
3. Python/Node.js未正确安装

---

## 解决方案

### 方案1：检查服务器是否启动

#### 步骤1：打开任务管理器
按 `Ctrl + Shift + Esc`，查看是否有以下进程：
- `python.exe`
- `node.exe`

如果没有，说明服务器未启动。

#### 步骤2：手动启动服务器

**打开PowerShell或CMD（在项目根目录）：**

方法A - 使用Python：
```bash
python -m http.server 8000
```

方法B - 使用Python（如果上面不行）：
```bash
py -m http.server 8000
```

方法C - 使用Node.js：
```bash
npx http-server -p 8000
```

**看到以下信息说明启动成功：**
```
Serving HTTP on :: port 8000 (http://[::]:8000/) ...
```

---

### 方案2：更换端口

如果8000端口被占用，尝试其他端口：

```bash
# 使用8080端口
python -m http.server 8080

# 然后访问
http://localhost:8080
```

---

### 方案3：检查防火墙

#### Windows防火墙设置：

1. 打开"Windows安全中心"
2. 点击"防火墙和网络保护"
3. 点击"允许应用通过防火墙"
4. 找到Python或Node.js，确保勾选了"专用"和"公用"

#### 临时关闭防火墙测试：
```powershell
# 以管理员身份运行PowerShell
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# 测试完成后记得重新开启
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

---

### 方案4：使用127.0.0.1代替localhost

有时localhost解析有问题，尝试直接使用IP：

```
http://127.0.0.1:8000
```

---

### 方案5：检查Python/Node.js安装

#### 检查Python：
```bash
python --version
# 或
py --version
```

如果显示版本号（如 Python 3.x.x），说明已安装。

#### 检查Node.js：
```bash
node --version
```

如果显示版本号（如 v16.x.x），说明已安装。

#### 如果都没安装：

**安装Python（推荐）：**
1. 访问：https://www.python.org/downloads/
2. 下载最新版本
3. 安装时勾选"Add Python to PATH"
4. 重启电脑

**或安装Node.js：**
1. 访问：https://nodejs.org/
2. 下载LTS版本
3. 默认安装
4. 重启电脑

---

### 方案6：使用其他HTTP服务器

#### 使用PHP（如果已安装）：
```bash
php -S localhost:8000
```

#### 使用VS Code插件：
1. 安装"Live Server"插件
2. 右键点击index.html
3. 选择"Open with Live Server"

---

## 完整操作步骤（推荐）

### 第1步：确认Python已安装
```bash
python --version
```

### 第2步：在项目根目录打开PowerShell
- 在文件资源管理器中，按住Shift键
- 右键点击空白处
- 选择"在此处打开PowerShell窗口"

### 第3步：启动服务器
```bash
python -m http.server 8000
```

### 第4步：保持PowerShell窗口打开
不要关闭这个窗口！服务器需要一直运行。

### 第5步：打开浏览器
访问：`http://localhost:8000`

或者：`http://127.0.0.1:8000`

---

## 验证服务器是否启动成功

### 方法1：查看PowerShell输出
应该看到类似这样的信息：
```
Serving HTTP on :: port 8000 (http://[::]:8000/) ...
```

### 方法2：检查端口
打开新的PowerShell窗口，运行：
```bash
netstat -ano | findstr :8000
```

如果看到输出，说明端口正在使用。

### 方法3：访问测试
在浏览器中访问：
```
http://localhost:8000
```

应该能看到文件列表或主页面。

---

## 常见错误及解决

### 错误1：'python' 不是内部或外部命令
**解决：** Python未安装或未添加到PATH
- 重新安装Python，勾选"Add Python to PATH"
- 或使用 `py` 命令代替 `python`

### 错误2：Address already in use
**解决：** 端口被占用
```bash
# 查找占用进程
netstat -ano | findstr :8000

# 结束进程（替换<PID>为实际进程ID）
taskkill /PID <PID> /F

# 或使用其他端口
python -m http.server 8080
```

### 错误3：Permission denied
**解决：** 权限不足
- 以管理员身份运行PowerShell
- 或使用大于1024的端口号

---

## 后续更新数据的方法

服务器启动后，更新数据很简单：

1. **更新CSV文件**
   - 直接替换CSV文件
   - 保持文件名不变

2. **刷新浏览器**
   - 按F5刷新页面
   - 或按Ctrl+F5强制刷新

3. **无需重启服务器**
   - 服务器会自动读取最新的文件
   - 只需刷新浏览器即可

---

## 推荐的工作流程

### 日常使用：
1. 打开PowerShell，运行：`python -m http.server 8000`
2. 保持PowerShell窗口打开
3. 在浏览器中访问：`http://localhost:8000`
4. 需要更新数据时，替换CSV文件，刷新浏览器

### 结束使用：
1. 在PowerShell窗口按 `Ctrl+C`
2. 关闭浏览器

---

## 需要帮助？

如果以上方法都不行，请提供以下信息：

1. Python版本：`python --version`
2. 操作系统版本
3. 运行 `python -m http.server 8000` 后的完整输出
4. 浏览器控制台（F12）的错误信息

---

**最后更新**: 2026-02-27
