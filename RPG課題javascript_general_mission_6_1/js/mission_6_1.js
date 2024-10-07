// キャラクターデータの定義
const CHARACTER_DATA = {
  A: {
    src: "images/character_kishi_man_01_blue_black.png",
    name: "青い勇者",
    levelUpCondition: 3,
    encounterRate: 10, // 敵との遭遇率
    winProbability: 55,
    escapeProbability: 99,
  },
  B: {
    src: "images/character_tozoku_green.png",
    name: "緑の勇者",
    levelUpCondition: 2,
    encounterRate: 5, // 敵との遭遇率
    winProbability: 20,
    escapeProbability: 50,
  },
};

// 敵データの定義
const ENEMY_DATA = {
  "monster_green": {
    src: "images/character_monster_green.png",
    name: "みどりのやつ",
    style: "background-size: 50% auto", 
    attackProbability: 20, // 攻撃
    strength: 10 // 力
  },
  "dragon_blue": {
    src: "images/character_monster_dragon_blue.png",
    name: "とんでるやつ",
    attackProbability: 60, // 攻撃確率: 60%
    strength: 20 // 攻撃力: 20
  },
};


// 敵出現率の比率
const ENCOUNTER_RATE_RATIO = {
  "monster_green": 2, 
  "dragon_blue": 1
};

// 敵を選択する関数
function selectEnemy() {
  //  合計比率を計算
  const totalRatio = Object.values(ENCOUNTER_RATE_RATIO).reduce((sum, ratio) => sum + ratio, 0);
  // ランダムな数値を生成 (0 ~ totalRatio)
  const randomNumber = Math.random() * totalRatio;

  let accumulatedRatio = 0;
  for (const enemyKey in ENCOUNTER_RATE_RATIO) {
    accumulatedRatio += ENCOUNTER_RATE_RATIO[enemyKey];
    if (randomNumber <= accumulatedRatio) {
      return ENEMY_DATA[enemyKey];
    }
  }
}



// 背景画像のデータ
const BACKGROUNDS = [
  { name: '平地', src: 'images/bg_ground.jpg', encounterRate: 1 },
  { name: '森', src: 'images/bg_forest.jpg', encounterRate: 15 },   
  { name: '沼', src: 'images/bg_numa.jpg', encounterRate: 30 },     
];

// グローバル変数
let selectedCharacter = null;
let selectedEnemy = null;
let backgroundIndex = 0;
let clickCount = 0;
let gameStarted = false; // ゲームが開始されたかどうかのフラグ

// HTML要素の取得
//home-select
const characterA = document.querySelector('.characterA');
const characterB = document.querySelector('.characterB');
const characterNameInput = document.getElementById('characterName');
const decideButton = document.getElementById('decide');
const errorMessage = document.createElement('p'); 
errorMessage.id = 'error-message'; 
document.body.appendChild(errorMessage); // bodyの最後に追加
//field
const fieldContainer = document.getElementById('fieldScreen');
const fieldBackground = document.getElementById('fieldBackground'); 
const enemyBackground = document.getElementById('enemyBackground');
const statusList = document.getElementById('statusList');
const upButton = document.getElementById('up');
const downButton = document.getElementById('down');
const leftButton = document.getElementById('left');
const rightButton = document.getElementById('right');
const enemyImage = document.getElementById('enemy-image');
const messageBox = document.getElementById('messageBox');

// プレイヤーのデータ
let player = {
  name: "",
  character: null,
  x: 0,
  y: 0,
  steps: 0,
  level: 1,
  hp: 100,
  enemiesDefeated: 0, // 倒した敵の数
  enemiesEncountered: 0 // 出会った敵の数
};

// ローカルストレージのキー
const playerDataKey = "playerData";

// 画面切り替え関数
function switchScreen(screenId) {
  const screens = ['homeScreen', 'selectScreen', 'fieldScreen'];
  screens.forEach(id => {
    const screen = document.getElementById(id);
    screen.style.display = id === screenId ? 'block' : 'none';
  });
}

// ページ読み込み時にホーム画面を表示
switchScreen('homeScreen');

// キャラABのサイズを60%に変更
characterA.style.transform = 'scale(0.6)';
characterB.style.transform = 'scale(0.6)';
// 決定ボタンの初期状態は無効化
decideButton.disabled = true;

// 入力値をチェックする関数
function checkInput() {
  if (selectedCharacter && characterNameInput.value.trim() !== "") {
    decideButton.disabled = false;
    errorMessage.textContent = '';
  } else {
    decideButton.disabled = true;
    errorMessage.textContent = "キャラクターを選択し、名前を入力してください";
    errorMessage.style.color = 'red'; 
  }
}

// キャラクターを選択する関数
function selectCharacter(char) {
  selectedCharacter = char;
  // 選択されたキャラクターに応じてスタイルを変更
  characterA.classList.toggle('selectedONE', char === 'A');
  characterB.classList.toggle('selectedONE', char === 'B');
  // 入力値のチェック
  checkInput();
}

// キャラクターA・ キャラクターBがクリックされたときの処理
characterA.addEventListener('click', () => selectCharacter('A'));
characterB.addEventListener('click', () => selectCharacter('B'));

// 入力欄の値が変更されたときにチェック
characterNameInput.addEventListener('input', checkInput);

// 決定ボタンがクリックされたときの処理
decideButton.addEventListener('click', () => {
  // 入力値を取得
  const characterName = characterNameInput.value.trim();
  // 入力チェック
  if (!selectedCharacter || characterName === "") {
    errorMessage.textContent = "キャラクターを選択し、名前を入力してください";
    errorMessage.style.color = 'red'; 
    return;
  }

  // プレイヤーの初期設定
  player.character = CHARACTER_DATA[selectedCharacter];
  player.name = characterName;

  // ゲームが開始されたことを記録
  gameStarted = true;

  // フィールド画面を表示
  initField();
});

// スタートボタン押下時の処理
function startGame() {
  // 選択画面を表示
  switchScreen('selectScreen');
}

// コンティニューボタン押下時の処理
function continueGame() {
  // ローカルストレージからプレイヤーデータを取得
  const savedData = localStorage.getItem(playerDataKey);

  // データがある場合
  if (savedData) {
    // データをオブジェクトに変換
    player = JSON.parse(savedData);
    // フィールド画面を初期化
    initField();
  } else {
    // データがない場合
    alert("セーブデータがありません。");
    // スタート画面に戻る
    switchScreen('homeScreen');
  }
}

// 移動関数
function move(direction) {
  switch (direction) {
    case 'up': player.y -= 1; break;
    case 'down': player.y += 1; break;
    case 'left': player.x -= 1; break;
    case 'right': player.x += 1; break;
  }
  // 歩数増加
  player.steps++;
  // ステータス更新
  updateStatus();
  // 背景画像の変更
  changeBackground();
  // 敵との遭遇判定
  checkEncounter();
}

// ステータス表示の更新
function updateStatus() {
  statusList.innerHTML = `
    <li>名前: ${player.name}</li>
    <li>レベル: ${player.level}</li>
    <li>HP: ${player.hp}</li>
    <li>歩数: ${player.steps}</li>
    <li>倒した敵: ${player.enemiesDefeated}</li>
    <li>出会った敵: ${player.enemiesEncountered}</li>
  `;

  // プレイヤーデータをローカルストレージに保存
  localStorage.setItem(playerDataKey, JSON.stringify(player));
}

// フィールド画面の初期化処理
function initField() {
  switchScreen('fieldScreen');
  updateStatus();
  changeBackground();
  const backgroundImage = BACKGROUNDS[0]; //最初の背景画面
  enemyBackground.style.backgroundImage = `url(${backgroundImage.src})`;
  fieldBackground.style.backgroundImage = `url(${backgroundImage.src})`;
  hideEnemyAndCommands(); 
  messageBox.textContent = "どちらかにしばらく進むと何者かが出てきます";
  // 選ばれたキャラクター画像を表示
  showSelectedCharacter();
}

// 選択されたキャラクターの画像を表示する関数・コントローラー部分に表示
function showSelectedCharacter() {
  const controller = document.getElementById('controller');
  const characterImage = document.createElement('img');
  characterImage.src = player.character.src;
  characterImage.alt = player.character.name;
  characterImage.style.width = '40px'; 
  characterImage.style.height = '40px'; 
  characterImage.style.position = 'relative'; //コントローラーの中央に調整
  characterImage.style.left = '65px';      
  characterImage.style.top = '60px';       

  controller.appendChild(characterImage);
}


// 背景画像の変更
function changeBackground() {
  clickCount++;
  if (clickCount % 10 === 0) {
    backgroundIndex = (backgroundIndex + 1) % BACKGROUNDS.length;
    const backgroundImage = BACKGROUNDS[backgroundIndex];
    const img = new Image();
    img.src = backgroundImage.src;
      img.onload = () => {
      enemyBackground.style.backgroundImage = `url(${backgroundImage.src})`;
      fieldBackground.style.backgroundImage = `url(${backgroundImage.src})`;
    }
  }
}

// 敵との遭遇判定
function checkEncounter() {
  const currentBackground = BACKGROUNDS[backgroundIndex];

  // 遭遇判定
  if (Math.random() * 100 < currentBackground.encounterRate) {
    player.enemiesEncountered++;
    console.log('敵に遭遇！');

    // ランダムに敵を選択
    const enemyKeys = Object.keys(ENEMY_DATA);
    const randomIndex = Math.floor(Math.random() * enemyKeys.length);
    selectedEnemy = ENEMY_DATA[enemyKeys[randomIndex]];

    // 敵の情報が存在する場合
    if (selectedEnemy) {
      // 敵の画像を表示
      enemyImage.src = selectedEnemy.src;
      enemyImage.style.width = '100px';
      enemyImage.style.height = 'auto';
      enemyImage.style.position = 'relative'; 
      enemyImage.style.display = 'block'; 
      enemyImage.style.opacity = '1';

      // 戦闘画面の準備
      messageBox.textContent = `${selectedEnemy.name}が現れた！どうする？`;

      // 戦闘コマンドを表示
      showBattleCommands();
    } else {
    console.log('敵と遭遇せず');
    messageBox.textContent = ''; 
    hideEnemyAndCommands(); 
    }
  }
}

// 戦闘コマンドを表示する関数
function showBattleCommands() {
  document.getElementById('comandBox').innerHTML = `
    <button id="fight">たたかう</button> 
    <button id="escape">にげる🏃‍♀️</button>
  `;
  // 戦闘コマンドにイベントリスナーを追加
  document.getElementById('fight').addEventListener('click', attack);
  document.getElementById('escape').addEventListener('click', attemptEscape);
  // 十字キーを無効化
  disableArrowKeys();
}

// 攻撃関数
function attack() {
  enemyImage.style.opacity = '1';
  if (Math.random() * 50 < player.character.winProbability) {
    // 敵を倒した場合
    player.enemiesDefeated++; 
    messageBox.textContent = `${selectedEnemy.name}を倒した！`;
    // レベルアップ処理
  if (player.enemiesDefeated % player.character.levelUpCondition === 0) {
    levelUp();
    }
    // 敵の画像をフェードアウトさせて非表示にする
    enemyImage.style.opacity = '0.5';
    setTimeout(() => {
      enemyImage.style.display = 'none';
      messageBox.textContent = "歩く方向を押してください";
      // コマンドボタンを非表示にする
      hideEnemyAndCommands();
    }, 2000);
  } else {
    // 敵の攻撃を受けた場合
    messageBox.textContent = `${selectedEnemy.name}から攻撃を受けた！`;
    // 背景を1秒間赤くする
    controller.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    setTimeout(() => {
      controller.style.backgroundColor = ''; // 赤色を解除
    }, 1000);
    player.hp -= 30;
    // HPが0以下になったらゲームオーバー
    if (player.hp <= 0) {
      messageBox.textContent = "勇者は死んでしまった";
      setTimeout(() => {
        // 2秒かけてフェードアウト
        fieldBackground.style.opacity = '0';
        setTimeout(() => {
          // ホーム画面に戻る
          switchScreen('homeScreen');
          // ゲームをリセット
          resetGame();
        }, 2000); // 2秒後に画面遷移
      }, 2000); 
    } else {
      // HPが0以上なら戦闘継続
      updateStatus();
      showBattleCommands();
    }
  }
}

// レベルアップ関数
function levelUp() {
  player.level++;
  player.character.winProbability += 5; // 勝率を5%上げる
  messageBox.textContent = `レベルアップ！レベル${player.level}になった！`;
  updateStatus(); // ステータス更新
}







// 逃げる処理
function attemptEscape() {
  if (Math.random() * 100 < player.character.escapeProbability) {
    messageBox.textContent = "逃げることに成功した！";
    setTimeout(() => {
      hideEnemyAndCommands(); 
    }, 1000);
  } else {
    messageBox.textContent = `${selectedEnemy.name}に逃げられない！`;
    // 敵の攻撃ターンに移行 (ここではattack関数を呼び出す)
    setTimeout(attack, 1000);
  }
}

// 敵の画像とコマンドボタンを非表示にするための関数
function hideEnemyAndCommands() {
  enemyImage.style.display = 'none';
  document.getElementById('comandBox').innerHTML = ''; // コマンドボタンを削除
  enableArrowKeys();
}

// 十字キーを無効化する関数
function disableArrowKeys() {
  upButton.disabled = true;
  downButton.disabled = true;
  leftButton.disabled = true;
  rightButton.disabled = true;
}

// 十字キーを有効化する関数
function enableArrowKeys() {
  upButton.disabled = false;
  downButton.disabled = false;
  leftButton.disabled = false;
  rightButton.disabled = false;
}

// ゲームをリセットする関数
function resetGame() {
  // グローバル変数を初期化
  selectedCharacter = null;
  selectedEnemy = null;
  backgroundIndex = 0;
  clickCount = 0;
  gameStarted = false;

  // プレイヤーデータを初期化
  player = {
    name: "",
    character: null,
    x: 0,
    y: 0,
    steps: 0,
    level: 1,
    hp: 100,
    enemiesDefeated: 0,
    enemiesEncountered: 0
  };

  // ローカルストレージからプレイヤーデータを削除
  localStorage.removeItem(playerDataKey);

  // 画面をリロード
  location.reload();
}

// 移動ボタンのイベントリスナー
upButton.addEventListener('click', () => move('up'));
downButton.addEventListener('click', () => move('down'));
leftButton.addEventListener('click', () => move('left'));
rightButton.addEventListener('click', () => move('right'));