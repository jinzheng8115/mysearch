#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
搜索引擎 - Python Flask版本
"""

import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# 导入搜索引擎模块
from search_engines import zhipuai, bochaai, searxng

# 加载环境变量
load_dotenv()

app = Flask(__name__, static_folder='.')

# 启用CORS
CORS(app)

@app.route('/')
def index():
    """提供首页"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    """提供静态文件"""
    return send_from_directory('.', path)

@app.route('/api/search')
def search():
    """搜索API端点"""
    query = request.args.get('query', '')
    engine = request.args.get('engine', 'search_std')  # 默认使用智谱基础搜索

    # 验证搜索引擎
    valid_engines = ['search_std', 'bochaai', 'searxng']
    if engine not in valid_engines:
        return jsonify({'error': f'无效的搜索引擎: {engine}'}), 400

    if not query:
        return jsonify({'error': '搜索查询不能为空'}), 400

    try:
        print(f'发送搜索请求: {query}, 搜索引擎: {engine}')

        # 根据选择的搜索引擎调用相应的模块
        if engine == 'bochaai':
            # 获取Bocha AI的额外参数
            freshness = request.args.get('freshness', None)
            summary_param = request.args.get('summary', None)
            count_param = request.args.get('count', None)
            page_param = request.args.get('page', None)

            # 处理布尔类型参数
            summary = None
            if summary_param is not None:
                summary = summary_param.lower() == 'true'

            # 处理整数类型参数
            count = None
            if count_param is not None:
                try:
                    count = int(count_param)
                except ValueError:
                    pass

            page = None
            if page_param is not None:
                try:
                    page = int(page_param)
                except ValueError:
                    pass

            # 调用Bocha AI搜索引擎并传递所有参数
            result = bochaai.search(query, freshness, summary, count, page)
        elif engine == 'searxng':
            # 获取SearXNG的额外参数
            engines = request.args.get('engines', None)  # 要使用的搜索引擎，用逗号分隔
            language = request.args.get('language', 'auto')  # 语言
            safesearch_param = request.args.get('safesearch', '1')  # 安全搜索级别
            time_range = request.args.get('time_range', None)  # 时间范围
            count_param = request.args.get('count', None)  # 结果数量

            # 处理整数类型参数
            safesearch = 1  # 默认值
            try:
                safesearch = int(safesearch_param)
            except ValueError:
                pass

            count = None
            if count_param is not None:
                try:
                    count = int(count_param)
                except ValueError:
                    pass

            # 调用SearXNG搜索引擎并传递所有参数
            result = searxng.search(query, engines, language, safesearch, time_range, count)
        else:
            # 调用智谱AI搜索引擎
            result = zhipuai.search(query, engine)

        # 检查是否有错误
        if 'error' in result:
            return jsonify(result), 500

        # 返回搜索结果
        return jsonify(result)

    except Exception as e:
        # 记录错误
        if engine == 'bochaai':
            engine_name = 'Bocha AI'
        elif engine == 'searxng':
            engine_name = 'SearXNG'
        else:
            engine_name = '智谱AI'
        print(f'{engine_name} 搜索API错误: {str(e)}')

        # 返回错误信息
        error_response = {
            'error': f'{engine_name} 搜索请求失败',
            'message': str(e)
        }

        return jsonify(error_response), 500

if __name__ == '__main__':
    # 获取端口，默认为5000
    port = int(os.getenv('PORT', 5000))

    # 启动服务器
    app.run(host='0.0.0.0', port=port, debug=True)
