# 墨焕科技（上海）游戏网站

## 项目简介

墨焕科技（上海）游戏工作室官方网站，展示公司游戏作品、招聘信息及联系方式。

## 项目结构

```
d:/Work/7/
│
├── index.html          # 加载动画页面
│                       # 功能：炫酷的MH LOGO入场动画
│                       # 特性：
│                       #   - 线条绘制动画（MH和Games分别绘制）
│                       #   - 粒子背景（支持响应式）
│                       #   - 自动跳转/手动跳过
│                       #   - 移动端适配
│
├── home.html           # 网站主页
│                       # 功能：完整的游戏公司展示网站
│                       # 包含：
│                       #   - 导航栏（MH Logo）
│                       #   - 英雄区域
│                       #   - 游戏作品展示
│                       #   - 关于我们
│                       #   - 加入我们（招聘）
│                       #   - 联系我们
│                       #   - 页脚
│
├── css/
│   └── style.css       # 全站样式文件
│                       # 包含：
│                       #   - 响应式设计
│                       #   - 动画效果
│                       #   - 霓虹配色方案
│
├── js/
│   └── main.js         # 全站交互脚本
│                       # 功能：
│                       #   - 导航交互
│                       #   - 粒子效果
│                       #   - 滚动动画
│                       #   - 表单验证
│                       #   - 卡片交互
│
├── images/             # 图片资源目录
│   └── games/         # 游戏图片（AI生成）
│
└── audio/             # 音频资源目录（AI生成）
    ├── bg-music.mp3  # 游戏背景音乐
    ├── welcome.mp3   # 欢迎语音
    └── level-up.mp3  # 关卡完成语音
```

## 🎮 游戏资源（AI生成）

使用 **MiniMax AI** 生成的游戏图片和音效：

### 游戏封面图片

| 游戏名称 | 描述 | 图片URL |
|---------|------|---------|
| **星际征途** | 太空科幻策略游戏 | [点击下载](http://hailuo-image-algeng-data-us.oss-us-east-1.aliyuncs.com/image_inference_output%2Ftalkie%2Fprod%2Fimg%2F2026-04-17%2F0d7a7693-de7c-4c3c-8e70-4d8fb002b34e_aigc.jpeg?Expires=1776447803&OSSAccessKeyId=LTAI5tRDTcyEYLLuBEpJRwCi&Signature=n2%2FXUHqS%2FJw7q7TAcj9E3s32k5Q%3D) |
| **幻境传说** | 开放世界RPG | [点击下载](http://hailuo-image-algeng-data-us.oss-us-east-1.aliyuncs.com/image_inference_output%2Ftalkie%2Fprod%2Fimg%2F2026-04-17%2F15b183a4-6388-4a77-98e8-3685685ab6ae_aigc.jpeg?Expires=1776447835&OSSAccessKeyId=LTAI5tRDTcyEYLLuBEpJRwCi&Signature=kLtgDBkSvBCGfnEXX2jGN6MIJdo%3D) |
| **极速漂移** | 真实赛车模拟 | [点击下载](http://hailuo-image-algeng-data-us.oss-us-east-1.aliyuncs.com/image_inference_output%2Ftalkie%2Fprod%2Fimg%2F2026-04-17%2F3cb05e07-a5e9-430e-b84d-d50e32f5feff_aigc.jpeg?Expires=1776447867&OSSAccessKeyId=LTAI5tRDTcyEYLLuBEpJRwCi&Signature=jFJl7BVwJ82pJ%2F3ET4q1NuUMMhU%3D) |
| **塔防纪元** | 创新塔防游戏 | [点击下载](http://hailuo-image-algeng-data-us.oss-us-east-1.aliyuncs.com/image_inference_output%2Ftalkie%2Fprod%2Fimg%2F2026-04-17%2Fd722e0d8-e00e-4d1f-9c7c-031f48e4ac17_aigc.jpeg?Expires=1776447897&OSSAccessKeyId=LTAI5tRDTcyEYLLuBEpJRwCi&Signature=%2FpilFkJFlMeLz%2BICAnrWt4g1h1U%3D) |

### 音频资源

| 音频名称 | 类型 | 描述 | URL |
|---------|------|------|-----|
| **bg-music.mp3** | 背景音乐 | 科技感电子游戏音乐 | [点击下载](https://minimax-algeng-chat-tts-us.oss-us-east-1.aliyuncs.com/music%2Fprod%2Ftts-20260417014633-MUvApnNEJvTYCKMK.mp3?Expires=1776447999&OSSAccessKeyId=LTAI5tCpJNKCf5EkQHSuL9xg&Signature=xI4o4Z6ylsdVg1OdbTTsj0%2BOo7U%3D) |
| **welcome.mp3** | 语音 | 欢迎提示语音 | [点击下载](https://minimax-algeng-chat-tts-us.oss-us-east-1.aliyuncs.com/audio%2Ftts-20260417014655-wCPkiNQGdFUycFmP.mp3?Expires=1776448016&OSSAccessKeyId=LTAI5tCpJNKCf5EkQHSuL9xg&Signature=rpGpGbJFh3g6oICjGrhnoNG%2F3%2FU%3D) |
| **level-up.mp3** | 语音 | 关卡完成语音 | [点击下载](https://minimax-algeng-chat-tts-us.oss-us-east-1.aliyuncs.com/audio%2Ftts-20260417014706-DopnFNQQWDriFFCq.mp3?Expires=1776448027&OSSAccessKeyId=LTAI5tCpJNKCf5EkQHSuL9xg&Signature=jFwwo%2FHwLi4p3YYPCPJ3xUaeWmA%3D) |

## 使用说明

### 下载AI生成资源

1. **下载游戏图片**
   - 点击上方表格中的图片链接
   - 在浏览器中打开并右键"图片另存为"
   - 保存到 `images/games/` 目录

2. **下载音频文件**
   - 点击上方表格中的音频链接
   - 在浏览器中打开并另存为
   - 保存到 `audio/` 目录

3. **更新HTML使用图片**
   在 `home.html` 中修改游戏卡片，示例：
   ```html
   <div class="game-card">
     <div class="game-image">
       <img src="images/games/星际征途.jpg" alt="星际征途">
     </div>
     <div class="game-info">
       <h3>星际征途</h3>
       <p>太空科幻策略游戏</p>
     </div>
   </div>
   ```

### 添加音效到网站

1. 在 `home.html` 底部添加音频标签：
   ```html
   <audio id="bgMusic" loop>
     <source src="audio/bg-music.mp3" type="audio/mpeg">
   </audio>
   ```

2. 在 `js/main.js` 中添加音乐控制：
   ```javascript
   // 背景音乐控制
   const bgMusic = document.getElementById('bgMusic');
   document.body.addEventListener('click', () => {
     bgMusic.play().catch(() => {});
   }, { once: true });
   ```

## 🎮 游戏作品展示

当前游戏列表：

1. **星际征途** - 太空科幻策略游戏
   - 特色：星际舰队、星球探索、策略战斗
   - 标签：策略、科幻、多人

2. **幻境传说** - 开放世界RPG
   - 特色：开放世界、魔法系统、剧情探索
   - 标签：RPG、冒险、奇幻

3. **极速漂移** - 真实赛车模拟
   - 特色：真实物理、车辆改装、多人竞技
   - 标签：竞速、模拟、体育

4. **塔防纪元** - 创新塔防游戏
   - 特色：多样塔防、策略布局、关卡挑战
   - 标签：塔防、策略、休闲

## 技术特性

- ✅ 响应式设计（桌面，平板，手机）
- ✅ 霓虹渐变配色
- ✅ 流畅动画效果
- ✅ 粒子背景效果（鼠标交互）
- ✅ AI生成游戏资源
- ✅ SEO友好
- ✅ 无障碍支持

## 如何运行

直接在浏览器中打开 `index.html` 文件即可查看。

## 联系方式

- 邮箱：inEthen@126.com
- 电话：+86 18737386905
- 地址：上海市浦东新区张江高科技园区

## AI工具使用记录

### MiniMax AI 生成内容

**生成时间**: 2024-04-17

**图片生成** (使用 image-01 模型):
- 星际征途: 太空科幻策略游戏封面
- 幻境传说: 开放世界RPG封面
- 极速漂移: 赛车游戏封面
- 塔防纪元: 塔防游戏封面

**音频生成**:
- 游戏背景音乐: 科技感电子音乐
- 欢迎语音: 女声，游戏欢迎提示
- 关卡语音: 女声，关卡完成提示

## 开发建议

1. **图片优化**
   - 使用 WebP 格式以提升加载速度
   - 压缩图片文件大小
   - 使用 CDN 加速（可选）

2. **性能优化**
   - 懒加载图片
   - 压缩 CSS/JS 文件
   - 使用 HTTP/2

3. **扩展功能**
   - 添加游戏详情页
   - 添加博客/新闻页面
   - 添加游戏下载功能
   - 添加用户评论区
   - 添加背景音乐自动播放

## 许可证

Copyright © 2024 墨焕科技（上海）. All rights reserved.
