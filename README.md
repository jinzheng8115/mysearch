# 智谱AI搜索引擎

一个基于智谱AI搜索API的网页搜索引擎，界面类似Bing。

## 功能特点

- 简洁美观的搜索界面
- 实时搜索建议
- 搜索结果展示
- 知识面板
- 响应式设计，适配移动设备

## 技术栈

- 前端：HTML, CSS, JavaScript
- 后端：Python, Flask
- API：智谱AI Web Search API

## 安装与运行

1. 安装依赖：

```
pip install -r requirements.txt
```

2. 配置环境变量：

创建一个`.env`文件，添加以下内容：

```
ZHIPUAI_API_KEY=你的智谱AI API密钥
PORT=5000
```

3. 启动服务器：

```
python app.py
```

4. 访问网站：

打开浏览器，访问 `http://localhost:5000`

## 使用方法

1. 在搜索框中输入关键词
2. 点击搜索按钮或按回车键
3. 查看搜索结果

## 注意事项

- 搜索查询不能超过78个字符
- 需要有效的智谱AI API密钥
- 搜索结果由智谱AI提供，质量取决于其API
