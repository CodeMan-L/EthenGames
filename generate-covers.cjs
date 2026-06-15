const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// 配置
const API_KEY = process.env.ARK_API_KEY || process.env.MODEL_IMAGE_API_KEY || process.env.MODEL_AGENT_API_KEY;
const API_BASE = (process.env.ARK_BASE_URL || process.env.MODEL_IMAGE_API_BASE || 'https://ark.cn-beijing.volces.com/api/v3').replace(/\/api\/coding\/v3$/, '/api/v3');
const MODEL = 'doubao-seedream-5-0-260128';
const OUTPUT_BASE = 'd:\\DemoViode\\public\\videos';

// 47部短剧数据（跳过 drama-0 和 drama-45）
const dramas = [
  { id: 1, name: '春运诡途，女诡给我拜大年', keywords: 'ghost, spring festival, train, supernatural' },
  { id: 2, name: '仙规改了：师父是狗', keywords: 'cultivation, romance comedy, xianxia' },
  { id: 3, name: '老爹摆烂后，我来当皇帝', keywords: 'emperor, politics, female lead' },
  { id: 4, name: '破冰之钥', keywords: 'revenge, rebirth, ice, thriller' },
  { id: 5, name: '三年不知枕边人', keywords: 'marriage betrayal, general, hidden identity' },
  { id: 6, name: '休书换我万贯财', keywords: 'business woman, ancient soap, empowerment' },
  { id: 7, name: '丧尸末世，冰系觉醒反杀夜', keywords: 'zombie apocalypse, ice power, survival' },
  { id: 8, name: '五百万重启人生', keywords: 'lottery winner, business success, revenge' },
  { id: 9, name: '赛博修仙：我的系统是国家队', keywords: 'cyberpunk, cultivation, mecha, system' },
  { id: 10, name: '碎玉金陵雪', keywords: 'jade pendant, tragic love, ancient nobility' },
  { id: 11, name: '她自顶峰来', keywords: 'workplace revenge, corporate, female CEO' },
  { id: 12, name: '针脚织就新生', keywords: 'fashion designer, 1980s, sewing, rags to riches' },
  { id: 13, name: '破茧赴荣光', keywords: 'student, gaokao retry, youth, determination' },
  { id: 14, name: '黑幕之下', keywords: 'whistleblower, corporate crime, justice' },
  { id: 15, name: '冷宫翻身掌权天下', keywords: 'empress, palace intrigue, modern CEO transmigration' },
  { id: 16, name: '浮城闺蜜假面局', keywords: 'fake friend, debt betrayal, mystery' },
  { id: 17, name: '重生掌我命运', keywords: 'rebirth, stock market, revenge, rich' },
  { id: 18, name: '拒婚之后海啸降临', keywords: 'ocean prince, tsunami, sacrifice, fantasy' },
  { id: 19, name: '果核王', keywords: 'zookeeper, fruit superpower, animals' },
  { id: 20, name: '深渊预警钟', keywords: 'alarm clock, superpower, conspiracy, programmer' },
  { id: 21, name: '我把车行干垮', keywords: 'car dealership fraud, consumer rights' },
  { id: 22, name: '薪火暖流年', keywords: 'mother-in-law conflict, career woman, family' },
  { id: 23, name: '传承掌舵人', keywords: 'rich kid downfall, business empire, redemption' },
  { id: 24, name: '此生自有光芒', keywords: 'tailor, livestream, female empowerment, phoenix' },
  { id: 25, name: '被砸店后我摊牌了', keywords: 'restaurant owner, secret heir, gangster' },
  { id: 26, name: '基层砺剑露锋芒', keywords: 'executive hiding in grassroots, tech transformation' },
  { id: 27, name: '错位双生缘', keywords: 'switched twins, family secrets, warm reunion' },
  { id: 28, name: '隐龙潜渊', keywords: 'security guard, martial arts master, underground' },
  { id: 29, name: '老街旧物奇谭', keywords: 'repairman, antique radio, lost technology' },
  { id: 30, name: '校服下的天才设计师', keywords: 'high school, hanfu design genius, bullied girl' },
  { id: 31, name: '魔渊契约', keywords: 'black cat contract, cultivation, demon realm' },
  { id: 32, name: '我能听见你的恶意', keywords: 'mind reading, office conspiracy, experiment' },
  { id: 33, name: '凛冬携空间而生', keywords: 'apocalyptic winter, space storage, survival' },
  { id: 34, name: '弃子归来震蛮荒', keywords: 'tribal outcast, bloodline power, wasteland' },
  { id: 35, name: '顾总跪求我原谅', keywords: 'hidden heiress, divorce revenge, CEO husband' },
  { id: 36, name: '萌宝棋圣，助母登帝', keywords: 'chess prodigy baby, empress mother, palace' },
  { id: 37, name: '绝境翻盘怒赚千万', keywords: 'pregnant reborn, lottery, rich mom' },
  { id: 38, name: '两世错嫁后我封妃', keywords: 'twice wrong marriage, empress, cold hearted' },
  { id: 39, name: '年终奖羞辱我', keywords: 'year-end bonus injustice, employee revenge' },
  { id: 40, name: '嫡女焚骨再嫁时', keywords: 'pregnant betrayed, fire death, rebirth revenge' },
  { id: 41, name: '重生不做帝王妃', keywords: 'princess rejects prince, general husband' },
  { id: 42, name: '我的女友，要和干弟弟结婚了', keywords: '7-year relationship, fake brother, betrayal' },
  { id: 43, name: '礼封未拆，局已布好', keywords: 'scammer boyfriend, counter-trap, independent woman' },
  { id: 44, name: '饮恨踏归途，手撕负心人', keywords: 'labor death rebirth, cheating husband, empress' },
  { id: 46, name: '龙脉将倾，夜守山河', keywords: 'mute blacksmith, dragon vein, sword hero, revenge' },
  { id: 47, name: '骨玉通灵驭万兽', keywords: 'bone jade, beast tamer, fantasy adventure' },
  { id: 48, name: '逆梦改命赴情深', keywords: 'dream reversal, fate change, romance' }
];

function generatePrompt(drama) {
  return `Chinese short drama poster for "${drama.name}", ${drama.keywords}, dramatic composition, emotional atmosphere, cinematic lighting, dark moody atmosphere, high quality, detailed artwork`;
}

function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const mod = urlObj.protocol === 'https:' ? https : http;

    const req = mod.request(urlObj, {
      method: options.method || 'GET',
      headers: options.headers || {},
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, data });
      });
    });

    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const mod = urlObj.protocol === 'https:' ? https : http;

    mod.get(urlObj, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadImage(response.headers.location, outputPath).then(resolve).catch(reject);
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(outputPath);
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function generateImage(prompt) {
  const url = `${API_BASE}/images/generations`;
  const body = JSON.stringify({
    model: MODEL,
    prompt: prompt,
    size: '1536x2048',
    watermark: false,
    output_format: 'png'
  });

  console.log(`  Generating image...`);
  const result = await httpRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Length': Buffer.byteLength(body)
    },
    body: body
  });

  if (result.statusCode !== 200) {
    throw new Error(`API Error ${result.statusCode}: ${result.data}`);
  }

  const json = JSON.parse(result.data);
  if (json.error) {
    throw new Error(json.error.message || JSON.stringify(json.error));
  }

  if (!json.data || !json.data[0] || !json.data[0].url) {
    throw new Error('No image URL in response');
  }

  return json.data[0].url;
}

async function processDrama(drama) {
  const outputDir = path.join(OUTPUT_BASE, `drama-${drama.id}`);
  const outputPath = path.join(outputDir, 'cover.jpg');

  console.log(`\n[${drama.id}/47] Processing: ${drama.name}`);
  console.log(`  Output: ${outputPath}`);

  try {
    const prompt = generatePrompt(drama);
    console.log(`  Prompt: ${prompt.substring(0, 100)}...`);

    const imageUrl = await generateImage(prompt);
    console.log(`  Image URL obtained, downloading...`);

    await downloadImage(imageUrl, outputPath);
    console.log(`  ✅ Saved to: ${outputPath}`);

    return { success: true, id: drama.id, name: drama.name, path: outputPath };
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { success: false, id: drama.id, name: drama.name, error: error.message };
  }
}

async function main() {
  console.log('=' .repeat(80));
  console.log('Chinese Short Drama Cover Image Generator');
  console.log('=' .repeat(80));
  console.log(`Total dramas: ${dramas.length}`);
  console.log(`Output base: ${OUTPUT_BASE}`);
  console.log(`Model: ${MODEL}`);
  console.log(`Size: 1536x2048 (portrait_4_3)`);
  console.log('=' .repeat(80));

  if (!API_KEY) {
    console.error('\n❌ Error: No API key found!');
    console.error('Please set ARK_API_KEY or MODEL_IMAGE_API_KEY environment variable.');
    process.exit(1);
  }

  const results = [];
  for (let i = 0; i < dramas.length; i++) {
    const result = await processDrama(dramas[i]);
    results.push(result);

    // 避免请求过快
    if (i < dramas.length - 1) {
      console.log(`  Waiting 2 seconds before next request...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('GENERATION COMPLETE');
  console.log('='.repeat(80));

  const success = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✅ Success: ${success.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);

  if (failed.length > 0) {
    console.log('\nFailed items:');
    failed.forEach(f => {
      console.log(`  - [${f.id}] ${f.name}: ${f.error}`);
    });
  }

  console.log('\nGenerated files:');
  success.forEach(s => {
    console.log(`  ✅ ${s.path}`);
  });

  // 保存结果报告
  const reportPath = path.join(OUTPUT_BASE, 'cover-generation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Report saved to: ${reportPath}`);
}

main().catch(console.error);
