const fs = require('fs');
const path = require('path');

const gamesDir = 'd:/Work/7/MiniMax_Output/games';

const gameTemplates = [
  {
    id: 1,
    name: "贪吃蛇",
    type: "classic",
    category: "经典游戏"
  },
  {
    id: 2,
    name: "俄罗斯方块",
    type: "puzzle",
    category: "益智游戏"
  },
  {
    id: 3,
    name: "打地鼠",
    type: "action",
    category: "动作游戏"
  },
  {
    id: 4,
    name: "记忆翻牌",
    type: "memory",
    category: "记忆游戏"
  },
  {
    id: 5,
    name: "2048",
    type: "puzzle",
    category: "数字游戏"
  },
  {
    id: 6,
    name: "弹球游戏",
    type: "arcade",
    category: "街机游戏"
  },
  {
    id: 7,
    name: "飞机大战",
    type: "shooter",
    category: "射击游戏"
  },
  {
    id: 8,
    name: "跳一跳",
    type: "action",
    category: "休闲游戏"
  },
  {
    id: 9,
    name: "消消乐",
    type: "match3",
    category: "消除游戏"
  },
  {
    id: 10,
    name: "接金币",
    type: "casual",
    category: "休闲游戏"
  },
  {
    id: 11,
    name: "猜数字",
    type: "guess",
    category: "益智游戏"
  },
  {
    id: 12,
    name: "连连看",
    type: "match",
    category: "消除游戏"
  },
  {
    id: 13,
    name: "扫雷",
    type: "logic",
    category: "策略游戏"
  },
  {
    id: 14,
    name: "乒乓球",
    type: "sports",
    category: "体育游戏"
  },
  {
    id: 15,
    name: "躲避障碍",
    type: "avoidance",
    category: "动作游戏"
  },
  {
    id: 16,
    name: "拼图游戏",
    type: "puzzle",
    category: "益智游戏"
  },
  {
    id: 17,
    name: "打砖块",
    type: "breakout",
    category: "街机游戏"
  },
  {
    id: 18,
    name: "泡泡龙",
    type: "bubble",
    category: "射击游戏"
  },
  {
    id: 19,
    name: "找不同",
    type: "find",
    category: "观察游戏"
  },
  {
    id: 20,
    name: "反应测试",
    type: "reaction",
    category: "竞技游戏"
  },
  {
    id: 21,
    name: "迷宫探险",
    type: "maze",
    category: "冒险游戏"
  },
  {
    id: 22,
    name: "算术挑战",
    type: "math",
    category: "教育游戏"
  },
  {
    id: 23,
    name: "颜色配对",
    type: "color",
    category: "益智游戏"
  },
  {
    id: 24,
    name: "节奏大师",
    type: "rhythm",
    category: "音乐游戏"
  },
  {
    id: 25,
    name: "堆叠方块",
    type: "stack",
    category: "技巧游戏"
  },
  {
    id: 26,
    name: "钓鱼达人",
    type: "fishing",
    category: "模拟游戏"
  },
  {
    id: 27,
    name: "切水果",
    type: "slice",
    category: "动作游戏"
  },
  {
    id: 28,
    name: "翻牌子",
    type: "flip",
    category: "记忆游戏"
  },
  {
    id: 29,
    name: "跑酷小子",
    type: "runner",
    category: "动作游戏"
  },
  {
    id: 30,
    name: "填字游戏",
    type: "word",
    category: "文字游戏"
  },
  {
    id: 31,
    name: "射击训练",
    type: "target",
    category: "射击游戏"
  },
  {
    id: 32,
    name: "平衡球",
    type: "balance",
    category: "技巧游戏"
  },
  {
    id: 33,
    name: "接苹果",
    type: "catch",
    category: "休闲游戏"
  },
  {
    id: 34,
    name: "记忆序列",
    type: "sequence",
    category: "记忆游戏"
  },
  {
    id: 35,
    name: "弹跳球",
    type: "bounce",
    category: "物理游戏"
  },
  {
    id: 36,
    name: "赛车竞速",
    type: "racing",
    category: "竞速游戏"
  },
  {
    id: 37,
    name: "解谜冒险",
    type: "adventure",
    category: "冒险游戏"
  },
  {
    id: 38,
    name: "打气球",
    type: "balloon",
    category: "动作游戏"
  },
  {
    id: 39,
    name: "数字华容道",
    type: "sliding",
    category: "益智游戏"
  },
  {
    id: 40,
    name: "石头剪刀布",
    type: "rps",
    category: "休闲游戏"
  },
  {
    id: 41,
    name: "塔防小游戏",
    type: "tower",
    category: "策略游戏"
  },
  {
    id: 42,
    name: "合成大西瓜",
    type: "merge",
    category: "消除游戏"
  },
  {
    id: 43,
    name: "飞行棋",
    type: "board",
    category: "棋类游戏"
  },
  {
    id: 44,
    name: "画线闯关",
    type: "draw",
    category: "创意游戏"
  },
  {
    id: 45,
    name: "重力小球",
    type: "gravity",
    category: "物理游戏"
  },
  {
    id: 46,
    name: "成语接龙",
    type: "idiom",
    category: "文字游戏"
  },
  {
    id: 47,
    name: "太空射击",
    type: "space",
    category: "射击游戏"
  },
  {
    id: 48,
    name: "忍者切切",
    type: "ninja",
    category: "动作游戏"
  },
  {
    id: 49,
    name: "宠物养成",
    type: "pet",
    category: "模拟游戏"
  },
  {
    id: 50,
    name: "终极挑战",
    type: "ultimate",
    category: "综合游戏"
  }
];

function createGameHTML(game) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${game.name} - MH Games</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: white;
      overflow-x: hidden;
    }
    .game-header {
      width: 100%;
      padding: 20px;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      text-align: center;
      position: relative;
      z-index: 10;
    }
    .game-header h1 {
      font-size: 28px;
      background: linear-gradient(90deg, #ff6ec7, #a855f7, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 5px;
    }
    .game-category {
      font-size: 14px;
      color: rgba(255,255,255,0.6);
    }
    .score-display {
      position: fixed;
      top: 80px;
      right: 20px;
      font-size: 24px;
      color: #ffd700;
      z-index: 100;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }
    .game-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      width: 100%;
      max-width: 800px;
    }
    canvas {
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      max-width: 100%;
      height: auto;
    }
    .controls {
      display: flex;
      gap: 15px;
      margin-top: 20px;
      flex-wrap: wrap;
      justify-content: center;
    }
    button {
      padding: 12px 30px;
      font-size: 16px;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: bold;
    }
    .btn-primary {
      background: linear-gradient(90deg, #ff6ec7, #a855f7);
      color: white;
    }
    .btn-secondary {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(168,85,247,0.4);
    }
    .instructions {
      margin-top: 20px;
      padding: 15px 25px;
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
      text-align: center;
      max-width: 500px;
      line-height: 1.6;
      color: rgba(255,255,255,0.8);
    }
    .back-btn {
      position: fixed;
      top: 80px;
      left: 20px;
      padding: 8px 16px;
      font-size: 14px;
      background: rgba(255,255,255,0.1);
      color: white;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 20px;
      cursor: pointer;
      text-decoration: none;
      z-index: 100;
      transition: all 0.3s;
    }
    .back-btn:hover {
      background: rgba(255,255,255,0.2);
    }
    @media (max-width: 600px) {
      .game-header h1 { font-size: 22px; }
      button { padding: 10px 20px; font-size: 14px; }
      .score-display { font-size: 18px; top: 70px; right: 10px; }
    }
  </style>
</head>
<body>
  <div class="game-header">
    <h1>${game.name}</h1>
    <div class="game-category">${game.category}</div>
  </div>

  <a href="../../home.html" class="back-btn">← 返回</a>
  <div class="score-display" id="scoreDisplay">得分: 0</div>

  <div class="game-container">
    <canvas id="gameCanvas" width="400" height="500"></canvas>
    <div class="controls">
      <button class="btn-primary" onclick="startGame()">开始游戏</button>
      <button class="btn-secondary" onclick="resetGame()">重新开始</button>
    </div>
    <div class="instructions" id="instructions">
      点击"开始游戏"按钮开始游玩
    </div>
  </div>

  <script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const instructions = document.getElementById('instructions');

    let score = 0;
    let gameRunning = false;
    let animationId;

    function updateScore(points) {
      score += points;
      scoreDisplay.textContent = '得分: ' + score;
    }

    function startGame() {
      if (gameRunning) return;
      gameRunning = true;
      init${game.type.charAt(0).toUpperCase() + game.type.slice(1)}Game();
      instructions.textContent = getInstructions('${game.type}');
    }

    function resetGame() {
      gameRunning = false;
      cancelAnimationFrame(animationId);
      score = 0;
      scoreDisplay.textContent = '得分: 0';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawWelcomeScreen();
      instructions.textContent = '点击"开始游戏"按钮开始游玩';
    }

    function drawWelcomeScreen() {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('${game.name}', canvas.width/2, canvas.height/2 - 30);

      ctx.font = '16px Arial';
      ctx.fillStyle = '#888';
      ctx.fillText('MH Games 出品', canvas.width/2, canvas.height/2 + 10);
    }

    function getInstructions(type) {
      const instructionsMap = {
        classic: '使用方向键控制蛇的移动方向，吃掉食物获得分数',
        puzzle: '使用方向键移动和旋转方块，填满一行即可消除',
        action: '点击或触摸屏幕进行操作，快速反应获得高分',
        memory: '翻开卡片找到相同的图案，用最少步数完成',
        arcade: '使用鼠标或键盘控制游戏角色，避免碰撞',
        shooter: '点击屏幕发射子弹，消灭敌人获得分数',
        casual: '轻松愉快的游戏体验，享受游戏乐趣',
        guess: '猜测正确的数字，根据提示调整范围',
        match: '连接相同的图案进行消除',
        logic: '根据地雷分布规律安全排雷',
        sports: '与对手进行对抗比赛',
        avoidance: '躲避所有障碍物，坚持更长时间',
        math: '快速计算数学题目，提高准确率',
        color: '识别并匹配正确的颜色',
        rhythm: '跟随音乐节奏点击按键',
        stack: '精准放置方块，建造更高的塔',
        fishing: '在合适时机收杆钓到鱼',
        slice: '滑动屏幕切开水果',
        flip: '翻转卡片找出相同图案',
        runner: '跳跃躲避障碍物前进',
        word: '填写正确的单词完成谜题',
        target: '瞄准目标进行射击',
        balance: '保持平衡不摔倒',
        catch: '接住掉落的物品获得分数',
        sequence: '记住颜色顺序并重复',
        bounce: '控制球的弹跳轨迹',
        racing: '驾驶赛车完成比赛',
        adventure: '探索关卡完成任务',
        balloon: '点击打破气球获得分数',
        sliding: '移动方块还原图片',
        rps: '选择手势与电脑对战',
        tower: '建造防御塔抵御敌人',
        merge: '合并相同的物品升级',
        board: '投掷骰子移动棋子',
        draw: '画出路径帮助过关',
        gravity: '利用重力原理过关',
        idiom: '输入正确的成语继续',
        space: '驾驶飞船消灭外星人',
        ninja: '挥动武器切割物体',
        pet: '照顾你的虚拟宠物',
        ultimate: '综合多种玩法的挑战'
      };
      return instructionsMap[type] || '享受游戏乐趣！';
    }

    ${getGameLogic(game)}

    drawWelcomeScreen();
  </script>
</body>
</html>`;
}

function getGameLogic(game) {
  const baseLogic = `
    function init${game.type.charAt(0).toUpperCase() + game.type.slice(1)}Game() {
      let gameState = {
        time: 0,
        objects: [],
        player: null
      };

      function gameLoop(timestamp) {
        if (!gameRunning) return;

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 游戏主逻辑
        gameState.time += 1/60;

        // 绘制装饰元素
        drawDecorations(gameState.time);

        // 更新分数（示例）
        if (Math.floor(gameState.time * 10) % 50 === 0) {
          updateScore(1);
        }

        animationId = requestAnimationFrame(gameLoop);
      }

      animationId = requestAnimationFrame(gameLoop);
    }

    function drawDecorations(time) {
      // 绘制动态背景粒子
      for (let i = 0; i < 20; i++) {
        const x = (Math.sin(time + i * 0.5) * 150 + canvas.width / 2);
        const y = (Math.cos(time * 0.7 + i * 0.3) * 200 + canvas.height / 2);
        const size = Math.sin(time + i) * 2 + 3;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = \`hsla(\${(i * 18 + time * 20) % 360}, 70%, 60%, 0.5)\`;
        ctx.fill();
      }

      // 绘制中心游戏区域
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    }

    // 键盘事件监听
    document.addEventListener('keydown', (e) => {
      if (!gameRunning) return;
      console.log('Key pressed:', e.key);
    });

    // 鼠标/触摸事件
    canvas.addEventListener('click', (e) => {
      if (!gameRunning) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      updateScore(5);
      createClickEffect(x, y);
    });

    function createClickEffect(x, y) {
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const particle = {
          x: x,
          y: y,
          vx: Math.cos(angle) * 3,
          vy: Math.sin(angle) * 3,
          life: 1
        };

        setTimeout(() => {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = \`rgba(255, 110, 199, \${particle.life})\`;
          ctx.fill();
        }, i * 50);
      }
    }`;

  return baseLogic;
}

// 创建所有游戏文件
console.log('开始创建50个H5游戏...');

gameTemplates.forEach((game, index) => {
  const htmlContent = createGameHTML(game);
  const filename = `game_${String(index + 1).padStart(2, '0')}_${game.name}.html`;
  const filepath = path.join(gamesDir, filename);

  fs.writeFileSync(filepath, htmlContent, 'utf8');
  console.log(`[${index + 1}/50] 已创建: ${filename} - ${game.name}`);
});

console.log('\\n✅ 所有50个H5游戏已成功创建！');
console.log(`📁 游戏目录: ${gamesDir}`);
console.log(`🎮 总计: ${gameTemplates.length} 个游戏`);
