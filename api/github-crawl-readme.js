import GitHubReadmeCrawler from './github-readme-crawler.js';

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    console.log(`开始爬取用户 ${username} 的README数据...`);

    // 创建爬虫实例
    const crawler = new GitHubReadmeCrawler();

    // 爬取用户的README数据，限制为10个仓库
    const crawlOptions = {
      includeForks: false,
      maxRepos: 10,
      saveToFile: false
    };

    const readmeData = await crawler.crawlUserReadmes(username, crawlOptions);

    if (!readmeData || !readmeData.repositories || readmeData.repositories.length === 0) {
      return res.status(404).json({ 
        error: 'No README data found for this user',
        data: null
      });
    }

    // 限制返回的数据为10条
    const limitedData = {
      ...readmeData,
      repositories: readmeData.repositories.slice(0, 10)
    };

    console.log(`成功爬取到 ${limitedData.repositories.length} 个仓库的README数据`);

    return res.status(200).json({
      success: true,
      data: limitedData,
      message: `Successfully crawled ${limitedData.repositories.length} repositories`
    });

  } catch (error) {
    console.error('GitHub README爬取错误:', error);
    
    // 处理不同类型的错误
    if (error.message.includes('User not found')) {
      return res.status(404).json({ 
        error: 'GitHub user not found',
        message: 'The specified GitHub user does not exist'
      });
    }
    
    if (error.message.includes('API rate limit')) {
      return res.status(429).json({ 
        error: 'API rate limit exceeded',
        message: 'GitHub API rate limit exceeded. Please try again later.'
      });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Failed to crawl README data'
    });
  }
}