#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
智谱AI搜索引擎实现
"""

import os
import json
import time
import requests
from urllib.parse import urlparse

def search(query, engine='search_std'):
    """
    使用智谱AI搜索引擎执行搜索

    Args:
        query (str): 搜索查询
        engine (str, optional): 搜索引擎类型. Defaults to 'search_std'.

    Returns:
        dict: 搜索结果
    """
    # 获取API密钥
    api_key = os.getenv('ZHIPUAI_API_KEY')

    if not api_key:
        return {'error': '智谱AI API密钥未配置'}

    # 准备请求参数 - 严格按照API文档中指定的格式
    payload = {
        'search_engine': engine,  # 搜索引擎类型
        'search_query': query[:78]  # 限制查询不超过78个字符
    }

    print(f'智谱AI 请求参数: {payload}')

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }

    print(f'智谱AI 请求负载: {json.dumps(payload)}')

    # 发送请求
    try:
        print(f'智谱AI 请求URL: https://open.bigmodel.cn/api/paas/v4/web_search')
        print(f'智谱AI 请求头部: {headers}')
        print(f'智谱AI 请求负载: {json.dumps(payload, ensure_ascii=False)}')

        response = requests.post(
            'https://open.bigmodel.cn/api/paas/v4/web_search',
            json=payload,
            headers=headers,
            timeout=30  # 增加超时时间
        )

        # 检查响应状态和详细信息
        print(f'智谱AI 响应状态码: {response.status_code}')
        print(f'智谱AI 响应头部: {response.headers}')
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f'智谱AI API请求错误: {str(e)}')
        # 创建一个错误响应
        return {
            'id': f'zhipuai_error_{int(time.time())}',
            'created': int(time.time()),
            'search_intent': [
                {
                    'query': query,
                    'intent': 'SEARCH_NONE',
                    'keywords': query
                }
            ],
            'search_result': [
                {
                    'title': '智谱AI 搜索错误',
                    'link': '#',
                    'content': f'请求智谱AI搜索引擎时发生错误: {str(e)}',
                    'media': '智谱AI',
                    'icon': '',
                    'refer': '错误'
                }
            ]
        }

    # 获取响应数据
    try:
        # 打印原始响应文本以便调试
        response_text = response.text
        print(f'智谱AI 原始响应文本: {response_text}')

        result = response.json()
        print(f'智谱AI 搜索响应: {json.dumps(result, ensure_ascii=False)}')
    except json.JSONDecodeError as e:
        print(f'智谱AI 响应JSON解析错误: {str(e)}')
        # 创建一个错误响应
        return {
            'id': f'zhipuai_json_error_{int(time.time())}',
            'created': int(time.time()),
            'search_intent': [
                {
                    'query': query,
                    'intent': 'SEARCH_NONE',
                    'keywords': query
                }
            ],
            'search_result': [
                {
                    'title': '智谱AI 响应格式错误',
                    'link': '#',
                    'content': f'无法解析智谱AI的响应: {str(e)}\n原始响应: {response.text[:500]}...',
                    'media': '智谱AI',
                    'icon': '',
                    'refer': '错误'
                }
            ]
        }

    # 确保响应中包含必要的字段
    if 'id' not in result:
        result['id'] = f'zhipuai_{engine}_{int(time.time())}'

    if 'created' not in result:
        result['created'] = int(time.time())

    # 确保搜索意图字段存在
    if 'search_intent' not in result or not result['search_intent']:
        result['search_intent'] = [
            {
                'query': query,
                'intent': 'SEARCH_ALL',
                'keywords': query
            }
        ]

    # 确保搜索结果字段存在
    if 'search_result' not in result:
        result['search_result'] = []

    # 处理搜索结果，确保每个结果都有必要的字段
    if 'search_result' in result and isinstance(result['search_result'], list):
        for item in result['search_result']:
            # 确保标题字段存在
            if 'title' not in item or not item['title']:
                item['title'] = '智谱AI搜索结果'

            # 确保链接字段存在
            if 'link' not in item or not item['link']:
                item['link'] = '#'

            # 确保内容字段存在
            if 'content' not in item or not item['content']:
                item['content'] = '无可用内容'

            # 如果没有 media 字段，根据链接提取域名作为来源
            if 'media' not in item or not item['media']:
                try:
                    if item['link'] and item['link'] != '#':
                        domain = urlparse(item['link']).netloc
                        item['media'] = domain
                    else:
                        item['media'] = '智谱AI'
                except:
                    item['media'] = '智谱AI'

            # 确保图标字段存在
            if 'icon' not in item:
                item['icon'] = ''

            # 确保角标序号字段存在
            if 'refer' not in item:
                # 如果内容中包含图片标签，则标记为图片结果
                if '<img' in item.get('content', ''):
                    item['refer'] = '图片'
                else:
                    item['refer'] = ''

    return result
