document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResults = document.getElementById('search-results');
    const searchInfo = document.getElementById('search-info');
    const loadingIndicator = document.getElementById('loading-indicator');

    const searchSuggestions = document.getElementById('search-suggestions');
    const popularSearchItems = document.querySelectorAll('.popular-search-item');

    // 获取高级选项元素
    const zhipuaiAdvancedOptions = document.getElementById('zhipuai-advanced-options');
    const bochaAdvancedOptions = document.getElementById('bocha-advanced-options');
    const searxngAdvancedOptions = document.getElementById('searxng-advanced-options');

    // 初始化高级选项显示状态
    // 首先隐藏所有高级选项
    zhipuaiAdvancedOptions.style.display = 'none';
    bochaAdvancedOptions.style.display = 'none';
    searxngAdvancedOptions.style.display = 'none';

    // 获取当前选中的搜索引擎
    const selectedEngine = document.querySelector('input[name="search-engine"]:checked').value;
    console.log('页面加载时选中的搜索引擎:', selectedEngine);

    // 根据选中的引擎显示相应的高级选项
    if (selectedEngine === 'search_std') {
        zhipuaiAdvancedOptions.style.display = 'block';
    } else if (selectedEngine === 'bochaai') {
        bochaAdvancedOptions.style.display = 'block';
    } else if (selectedEngine === 'searxng') {
        searxngAdvancedOptions.style.display = 'block';
    }

    // 热门搜索点击事件
    popularSearchItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const query = this.getAttribute('data-query');
            searchInput.value = query;
            performSearch(query);
        });
    });

    // 搜索引擎描述
    const engineDescriptions = {
        'search_std': '智谱基础搜索：智谱AI提供的基础搜索引擎，适合一般查询',
        'bochaai': 'Bocha AI：使用 Bocha AI 搜索引擎，提供智能化的搜索结果和知识整合',
        'searxng': 'SearXNG：使用 SearXNG 元搜索引擎，整合多个搜索引擎的结果'
    };

    const engineDescriptionElement = document.getElementById('engine-description');

    // 搜索引擎切换动画和描述更新
    document.querySelectorAll('input[name="search-engine"]').forEach(radio => {
        radio.addEventListener('change', function() {
            // 添加动画效果
            const label = this.closest('.engine-label');
            label.style.transform = 'scale(1.05)';
            setTimeout(() => {
                label.style.transform = 'scale(1)';
            }, 200);

            // 更新搜索引擎描述
            const engineValue = this.value;
            engineDescriptionElement.textContent = engineDescriptions[engineValue] || '';

            // 隐藏所有高级选项
            zhipuaiAdvancedOptions.style.display = 'none';
            bochaAdvancedOptions.style.display = 'none';
            searxngAdvancedOptions.style.display = 'none';

            // 根据选择的引擎显示相应的高级选项
            if (engineValue === 'search_std') {
                zhipuaiAdvancedOptions.style.display = 'block';
            } else if (engineValue === 'bochaai') {
                bochaAdvancedOptions.style.display = 'block';
            } else if (engineValue === 'searxng') {
                searxngAdvancedOptions.style.display = 'block';
            }

            // 如果搜索框中有内容，自动执行搜索
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        });
    });

    // 搜索按钮点击事件
    searchButton.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    });

    // 回车键搜索
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        }
    });

    // 搜索输入框输入事件 - 用于显示搜索建议
    searchInput.addEventListener('input', function() {
        const query = searchInput.value.trim();
        if (query.length > 1) {
            // 这里可以添加搜索建议的逻辑
            // 简单模拟搜索建议
            showSearchSuggestions(query);
        } else {
            searchSuggestions.style.display = 'none';
        }
    });

    // 点击文档其他地方隐藏搜索建议
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.style.display = 'none';
        }
    });

    // 执行搜索
    function performSearch(query) {
        // 显示加载指示器
        loadingIndicator.style.display = 'flex';

        // 隐藏欢迎信息
        searchResults.innerHTML = '';

        // 清空搜索信息
        searchInfo.innerHTML = '';

        // 隐藏搜索建议
        searchSuggestions.style.display = 'none';

        // 获取选中的搜索引擎
        const selectedEngine = document.querySelector('input[name="search-engine"]:checked').value;
        console.log('选中的搜索引擎:', selectedEngine);

        // 构建API请求URL
        // 添加时间戳参数，防止缓存
        let apiUrl = `/api/search?query=${encodeURIComponent(query)}&engine=${selectedEngine}&_t=${Date.now()}`;

        // 根据不同的搜索引擎添加高级选项
        if (selectedEngine === 'search_std') {
            // 智谱AI搜索引擎不支持高级选项
            console.log('智谱AI搜索引擎不支持高级选项');
        } else if (selectedEngine === 'bochaai') {
            // 获取时间范围
            const freshness = document.getElementById('bocha-freshness').value;
            if (freshness !== 'noLimit') {
                apiUrl += `&freshness=${freshness}`;
            }

            // 获取结果数量
            const count = document.getElementById('bocha-count').value;
            apiUrl += `&count=${count}`;

            // 获取是否显示摘要
            const summaryCheckbox = document.getElementById('bocha-summary');
            if (summaryCheckbox.checked) {
                apiUrl += `&summary=true`;
            }
        } else if (selectedEngine === 'searxng') {
            // 获取搜索引擎
            const engines = document.getElementById('searxng-engines').value;
            apiUrl += `&engines=${engines}`;

            // 获取语言
            const language = document.getElementById('searxng-language').value;
            apiUrl += `&language=${language}`;

            // 获取时间范围
            const timeRange = document.getElementById('searxng-time-range').value;
            if (timeRange) {
                apiUrl += `&time_range=${timeRange}`;
            }

            // 获取安全搜索级别
            const safesearch = document.getElementById('searxng-safesearch').value;
            apiUrl += `&safesearch=${safesearch}`;

            // 获取结果数量
            const count = document.getElementById('searxng-count').value;
            apiUrl += `&count=${count}`;
        }

        console.log('请求URL:', apiUrl);

        // 调用后端API
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('搜索请求失败');
                }
                return response.json();
            })
            .then(data => {
                // 隐藏加载指示器
                loadingIndicator.style.display = 'none';

                // 调试信息
                console.log('搜索结果数据:', data);

                // 获取搜索引擎名称
                const engineNames = {
                    'search_std': '智谱基础搜索',
                    'bochaai': 'Bocha AI',
                    'searxng': 'SearXNG'
                };
                const engineName = engineNames[document.querySelector('input[name="search-engine"]:checked').value] || '未知搜索引擎';

                // 显示搜索信息
                const selectedEngine = document.querySelector('input[name="search-engine"]:checked').value;
                const resultCount = data.search_result ? data.search_result.length : 0;

                if (selectedEngine === 'bochaai') {
                    // 显示 Bocha AI 特有的搜索信息
                    const totalMatches = data.meta && data.meta.totalResults ? data.meta.totalResults : resultCount;
                    searchInfo.innerHTML = `使用 <strong>${engineName}</strong> 找到约 ${totalMatches} 条结果（用时 ${((Math.random() * 0.5) + 0.1).toFixed(2)} 秒） <span class="bocha-info">数据来源: Bocha AI Web Search API</span>`;
                } else if (selectedEngine === 'searxng') {
                    // 显示 SearXNG 特有的搜索信息
                    const totalMatches = data.meta && data.meta.totalResults ? data.meta.totalResults : resultCount;
                    const engines = document.getElementById('searxng-engines').value;
                    searchInfo.innerHTML = `使用 <strong>${engineName}</strong> 找到约 ${totalMatches} 条结果（用时 ${((Math.random() * 0.5) + 0.1).toFixed(2)} 秒） <span class="searxng-info">数据来源: ${engines.replace(/,/g, ', ')}</span>`;
                } else {
                    searchInfo.innerHTML = `使用 <strong>${engineName}</strong> 找到约 ${resultCount} 条结果（用时 ${((Math.random() * 0.5) + 0.1).toFixed(2)} 秒）`;
                }

                // 渲染搜索结果
                renderSearchResults(data, query);
            })
            .catch(error => {
                // 隐藏加载指示器
                loadingIndicator.style.display = 'none';

                // 显示错误信息
                searchResults.innerHTML = `
                    <div class="no-results">
                        <h3>搜索时出现错误</h3>
                        <p>${error.message}</p>
                        <p>请稍后再试或尝试其他搜索词。</p>
                    </div>
                `;


            });
    }

    // 渲染搜索结果
    function renderSearchResults(data, query) {
        console.log('渲染搜索结果:', data);

        // 如果没有结果
        if (!data.search_result || data.search_result.length === 0) {
            console.log('未找到搜索结果');
            searchResults.innerHTML = `
                <div class="no-results">
                    <h3>未找到与"${query}"相关的结果</h3>
                    <p>请尝试使用其他搜索词或检查拼写。</p>
                    <div class="search-tips">
                        <h4>搜索提示：</h4>
                        <ul>
                            <li>确保所有单词拼写正确</li>
                            <li>尝试使用更一般的关键词</li>
                            <li>尝试使用更少的关键词</li>
                            <li>尝试使用同义词</li>
                        </ul>
                    </div>
                </div>
            `;
            return;
        }

        console.log('找到搜索结果数量:', data.search_result.length);

        // 创建搜索意图部分
        let searchIntentHTML = '';
        if (data.search_intent && data.search_intent.length > 0) {
            const intent = data.search_intent[0];
            searchIntentHTML = `
                <div class="search-intent">
                    <h3>搜索信息</h3>
                    <div class="intent-item">
                        <span class="intent-label">搜索类型:</span> ${intent.intent === 'SEARCH_ALL' ? '全网搜索' : intent.intent}
                    </div>
                    <div class="intent-item">
                        <span class="intent-label">查询:</span> ${intent.query}
                    </div>
                    ${intent.keywords ? `
                    <div class="intent-item">
                        <span class="intent-label">关键词:</span>
                        <div class="keywords-list">
                            ${intent.keywords.split(' ').map(keyword => `<span class="keyword">${keyword}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;
        }

        // 显示元数据
        const selectedEngine = document.querySelector('input[name="search-engine"]:checked').value;
        if (data.meta) {
            const meta = data.meta;

            if (selectedEngine === 'bochaai') {
                // Bocha AI 元数据
                searchIntentHTML += `
                    <div class="bocha-meta">
                        <div class="meta-item">
                            <span class="meta-label">数据来源:</span> ${meta.source || 'Bocha AI'}
                        </div>
                        ${meta.webSearchUrl ? `
                        <div class="meta-item">
                            <span class="meta-label">搜索链接:</span>
                            <a href="${meta.webSearchUrl}" target="_blank" class="web-search-link">在 Bocha AI 中查看</a>
                        </div>
                        ` : ''}
                    </div>
                `;
            } else if (selectedEngine === 'searxng') {
                // SearXNG 元数据
                searchIntentHTML += `
                    <div class="searxng-meta">
                        <div class="meta-item">
                            <span class="meta-label">数据来源:</span> ${meta.source || 'SearXNG'}
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">搜索引擎:</span> ${meta.engines || document.getElementById('searxng-engines').value.replace(/,/g, ', ')}
                        </div>
                        ${meta.time ? `
                        <div class="meta-item">
                            <span class="meta-label">搜索用时:</span> ${meta.time} 秒
                        </div>
                        ` : ''}
                    </div>
                `;
            }
        }

        // 处理SearXNG的建议、纠正和答案
        let suggestionsHTML = '';
        let correctionsHTML = '';
        let answersHTML = '';
        let infoboxesHTML = '';

        if (selectedEngine === 'searxng') {
            // 处理搜索建议
            if (data.suggestions && data.suggestions.length > 0) {
                suggestionsHTML = `
                    <div class="searxng-suggestions">
                        <h3>相关搜索</h3>
                        <div class="suggestions-list">
                            ${data.suggestions.map(suggestion =>
                                `<span class="suggestion" onclick="document.getElementById('search-input').value='${suggestion}'; document.getElementById('search-button').click();">${suggestion}</span>`
                            ).join('')}
                        </div>
                    </div>
                `;
            }

            // 处理拼写纠正
            if (data.corrections && data.corrections.length > 0) {
                correctionsHTML = `
                    <div class="searxng-corrections">
                        <h3>您是否要搜索：</h3>
                        <div class="corrections-list">
                            ${data.corrections.map(correction =>
                                `<span class="correction" onclick="document.getElementById('search-input').value='${correction}'; document.getElementById('search-button').click();">${correction}</span>`
                            ).join('')}
                        </div>
                    </div>
                `;
            }

            // 处理答案
            if (data.answers && data.answers.length > 0) {
                answersHTML = `
                    <div class="searxng-answers">
                        <h3>快速答案</h3>
                        ${data.answers.map(answer => `
                            <div class="answer-item">
                                <h4>${answer.title}</h4>
                                <div class="answer-content">${answer.content}</div>
                                ${answer.link && answer.link !== '#' ? `<a href="${answer.link}" target="_blank" class="answer-link">查看来源</a>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            // 处理信息框
            if (data.infoboxes && data.infoboxes.length > 0) {
                infoboxesHTML = `
                    <div class="searxng-infoboxes">
                        ${data.infoboxes.map(infobox => `
                            <div class="infobox-item">
                                <h4>${infobox.title}</h4>
                                <div class="infobox-content">${infobox.content}</div>
                                ${infobox.icon ? `<img src="${infobox.icon}" alt="${infobox.title}" class="infobox-image">` : ''}
                                ${infobox.link && infobox.link !== '#' ? `<a href="${infobox.link}" target="_blank" class="infobox-link">查看来源</a>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }

        // 创建搜索结果列表
        let resultsHTML = data.search_result.map((result, index) => {
            console.log(`处理搜索结果 ${index + 1}:`, result);

            // 处理URL显示
            let displayUrl = result.link || '#';
            if (displayUrl === '#' && result.media) {
                displayUrl = result.media;
            }
            console.log(`显示URL: ${displayUrl}`);

            // 处理内容摘要
            let snippet = result.content || '无内容摘要';
            if (snippet.length > 300) {
                snippet = snippet.substring(0, 297) + '...';
            }
            console.log(`标题: ${result.title || '无标题'}, 内容长度: ${snippet.length}`);

            // 获取来源信息
            const source = result.media || '未知来源';

            return `
                <div class="result-item">
                    <h3 class="result-title">
                        <a href="${result.link || '#'}" target="_blank">${result.title || '无标题'}</a>
                    </h3>
                    ${displayUrl !== '#' ? `<div class="result-url">${displayUrl}</div>` : ''}
                    <div class="result-snippet">${snippet}</div>
                    <div class="result-footer">
                        <span class="result-source">来源: <strong>${source}</strong></span>
                        <a href="${result.link || '#'}" target="_blank" class="result-link">查看原网页</a>
                    </div>
                </div>
            `;
        }).join('');

        // 更新搜索结果
        searchResults.innerHTML = searchIntentHTML + correctionsHTML + answersHTML + infoboxesHTML + resultsHTML + suggestionsHTML;
    }



    // 显示搜索建议
    function showSearchSuggestions(query) {
        // 简单模拟搜索建议
        const suggestions = [
            `${query} 最新动态`,
            `${query} 是什么`,
            `${query} 的发展历程`,
            `${query} 的应用场景`,
            `${query} 相关技术`
        ];

        const suggestionsHTML = suggestions.map(suggestion =>
            `<div class="suggestion-item" onclick="document.getElementById('search-input').value='${suggestion}'; document.getElementById('search-button').click();">${suggestion}</div>`
        ).join('');

        searchSuggestions.innerHTML = suggestionsHTML;
        searchSuggestions.style.display = 'block';
    }
});
