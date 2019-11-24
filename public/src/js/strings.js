function StringsJa(){
	this.id = "ja"
	this.name = "日本語"
	this.regex = /^ja$|^ja-/
	this.font = "TnT, Meiryo, sans-serif"
	
	this.taikoWeb = "たいこウェブ"
	this.titleProceed = "クリックするかEnterを押す！"
	this.titleDisclaimer = "この非公式シミュレーターはバンダイナムコとは関係がありません。"
	this.titleCopyright = "Taiko no Tatsujin ©&™ 2011 BANDAI NAMCO Entertainment Inc."
	this.categories = {
		"J-POP": "J-POP",
		"アニメ": "アニメ",
		"ボーカロイド™曲": "ボーカロイド™曲",
		"バラエティ": "バラエティ",
		"クラシック": "クラシック",
		"ゲームミュージック": "ゲームミュージック",
		"ナムコオリジナル": "ナムコオリジナル"
	}
	this.selectSong = "曲をえらぶ"
	this.selectDifficulty = "むずかしさをえらぶ"
	this.back = "もどる"
	this.random = "ランダム"
	this.randomSong = "ランダムに曲をえらぶ"
	this.howToPlay = "あそびかた説明"
	this.aboutSimulator = "このシミュレータについて"
	this.gameSettings = "ゲーム設定"
	this.browse = "参照する…"
	this.defaultSongList = "デフォルト曲リスト"
	this.songOptions = "演奏オプション"
	this.none = "なし"
	this.auto = "オート"
	this.netplay = "ネットプレイ"
	this.easy = "かんたん"
	this.normal = "ふつう"
	this.hard = "むずかしい"
	this.oni = "おに"
	this.songBranch = "譜面分岐あり"
	this.sessionStart = "オンラインセッションを開始する！"
	this.sessionEnd = "オンラインセッションを終了する"
	this.loading = "ロード中..."
	this.waitingForP2 = "他のプレイヤーを待っている..."
	this.cancel = "キャンセル"
	this.note = {
		don: "ドン",
		ka: "カッ",
		daiDon: "ドン(大)",
		daiKa: "カッ(大)",
		drumroll: "連打ーっ!!",
		daiDrumroll: "連打(大)ーっ!!",
		balloon: "ふうせん"
	}
	this.combo = "コンボ"
	this.clear = "クリア"
	this.good = "良"
	this.ok = "可"
	this.bad = "不可"
	this.branch = {
		"normal": "普通譜面",
		"advanced": "玄人譜面",
		"master": "達人譜面"
	}
	this.pauseOptions = [
		"演奏をつづける",
		"はじめからやりなおす",
		"「曲をえらぶ」にもどる"
	]
	this.results = "成績発表"
	this.points = "点"
	this.maxCombo = "最大コンボ数"
	this.drumroll = "連打数"
	
	this.tutorial = {
		basics: [
			"流れてくる音符がワクに重なったらバチで太鼓をたたこう！",
			"赤い音符は面をたたこう（%sまたは%s）",
			"青い音符はフチをたたこう（%sまたは%s）",
			"USBコントローラがサポートされています！"
		],
		otherControls: "他のコントロール",
		otherTutorial: [
			"%sはゲームを一時停止します",
			"むずかしさをえらぶしながら%sキーを押しながらオートモードを有効",
			"むずかしさをえらぶしながら%sキーを押しながらネットプレイモードを有効"
		],
		ok: "OK"
	}
	this.about = {
		bugReporting: [
			"このシミュレータは現在開発中です。",
			"バグが発生した場合は、報告してください。",
			"Gitリポジトリかメールでバグを報告してください。"
		],
		diagnosticWarning: "以下の端末診断情報も併せて報告してください！",
		issueTemplate: "###### 下記の問題を説明してください。 スクリーンショットと診断情報を含めてください。"
	}
	this.session = {
		multiplayerSession: "オンラインセッション",
		linkTutorial: "Share this link with your friend to start playing together! Do not leave this screen while they join.",
		cancel: "キャンセル"
	}
	this.settings = {
		language: {
			name: "言語"
		},
		resolution: {
			name: "ゲームの解像度",
			high: "高",
			medium: "中",
			low: "低",
			lowest: "最低"
		},
		touchAnimation: {
			name: "タッチアニメーション"
		},
		keyboardSettings: {
			name: "キーボード設定",
			ka_l: "ふち(左)",
			don_l: "面(左)",
			don_r: "面(右)",
			ka_r: "ふち(右)"
		},
		gamepadLayout: {
			name: "そうさタイプ設定",
			a: "タイプA",
			b: "タイプB",
			c: "タイプC"
		},
		on: "オン",
		off: "オフ",
		default: "既定値にリセット",
		ok: "OK"
	}
	this.browserSupport = {
		browserWarning: "サポートされていないブラウザを実行しています (%s)",
		details: "詳しく",
		failedTests: "このテストは失敗しました：",
		supportedBrowser: "%sなどのサポートされているブラウザを使用してください"
	}
	this.creative = {
		creative: '創作',
		maker: 'メーカー'
	}
}
function StringsEn(){
	this.id = "en"
	this.name = "English"
	this.regex = /^en$|^en-/
	this.font = "TnT, Meiryo, sans-serif"
	
	this.taikoWeb = "Taiko Web"
	this.titleProceed = "Click or Press Enter!"
	this.titleDisclaimer = "This unofficial simulator is unaffiliated with BANDAI NAMCO."
	this.titleCopyright = "Taiko no Tatsujin ©&™ 2011 BANDAI NAMCO Entertainment Inc."
	this.categories = {
		"J-POP": "Pop",
		"アニメ": "Anime",
		"ボーカロイド™曲": "VOCALOID™ Music",
		"バラエティ": "Variety",
		"クラシック": "Classical",
		"ゲームミュージック": "Game Music",
		"ナムコオリジナル": "NAMCO Original"
	}
	this.selectSong = "Select Song"
	this.selectDifficulty = "Select Difficulty"
	this.back = "Back"
	this.random = "Random"
	this.randomSong = "Random Song"
	this.howToPlay = "How to Play"
	this.aboutSimulator = "About Simulator"
	this.gameSettings = "Game Settings"
	this.browse = "Browse…"
	this.defaultSongList = "Default Song List"
	this.songOptions = "Song Options"
	this.none = "None"
	this.auto = "Auto"
	this.netplay = "Netplay"
	this.easy = "Easy"
	this.normal = "Normal"
	this.hard = "Hard"
	this.oni = "Extreme"
	this.songBranch = "Diverge Notes"
	this.sessionStart = "Begin an Online Session!"
	this.sessionEnd = "End Online Session"
	this.loading = "Loading..."
	this.waitingForP2 = "Waiting for Another Player..."
	this.cancel = "Cancel"
	this.note = {
		don: "Don",
		ka: "Ka",
		daiDon: "DON",
		daiKa: "KA",
		drumroll: "Drum rollー!!",
		daiDrumroll: "DRUM ROLLー!!",
		balloon: "Balloon"
	}
	this.combo = "Combo"
	this.clear = "Clear"
	this.good = "GOOD"
	this.ok = "OK"
	this.bad = "BAD"
	this.branch = {
		"normal": "Normal",
		"advanced": "Professional",
		"master": "Master"
	}
	this.pauseOptions = [
		"Continue",
		"Retry",
		"Back to Select Song"
	]
	this.results = "Results"
	this.points = "pts"
	this.maxCombo = "MAX Combo"
	this.drumroll = "Drumroll"
	
	this.tutorial = {
		basics: [
			"When a note overlaps the frame, that is your cue to hit the drum!",
			"For red notes, hit the surface of the drum (%s or %s)...",
			"...and for blue notes, hit the rim! (%s or %s)",
			"USB controllers are also supported!"
		],
		otherControls: "Other controls",
		otherTutorial: [
			"%s \u2014 pause game",
			"%s while selecting difficulty \u2014 enable autoplay mode",
			"%s while selecting difficulty \u2014 enable 2P mode"
		],
		ok: "OK"
	}
	this.about = {
		bugReporting: [
			"This simulator is still in development.",
			"Please report any bugs you find.",
			"You can report bugs either via our Git repository or email."
		],
		diagnosticWarning: "Be sure to include the following diagnostic data!",
		issueTemplate: "###### Describe the problem you are having below. Please include a screenshot and the diagnostic information."
	}
	this.session = {
		multiplayerSession: "Multiplayer Session",
		linkTutorial: "Share this link with your friend to start playing together! Do not leave this screen while they join.",
		cancel: "Cancel"
	}
	this.settings = {
		language: {
			name: "Language"
		},
		resolution: {
			name: "Game Resolution",
			high: "High",
			medium: "Medium",
			low: "Low",
			lowest: "Lowest"
		},
		touchAnimation: {
			name: "Touch Animation"
		},
		keyboardSettings: {
			name: "Keyboard Settings",
			ka_l: "Left Rim",
			don_l: "Left Surface",
			don_r: "Right Surface",
			ka_r: "Right Rim"
		},
		gamepadLayout: {
			name: "Gamepad Layout",
			a: "Type A",
			b: "Type B",
			c: "Type C"
		},
		on: "On",
		off: "Off",
		default: "Reset to Defaults",
		ok: "OK"
	}
	this.browserSupport = {
		browserWarning: "You are running an unsupported browser (%s)",
		details: "Details...",
		failedTests: "The following tests have failed:",
		supportedBrowser: "Please use a supported browser such as %s"
	}
	this.creative = {
		creative: 'Creative',
		maker: 'Maker:'
	}
}
function StringsCn(){
	this.id = "cn"
	this.name = "简体中文"
	this.regex = /^zh$|^zh-CN$|^zh-SG$/
	this.font = "Microsoft YaHei, sans-serif"
	
	this.taikoWeb = "太鼓网页"
	this.titleProceed = "点击或按回车！"
	this.titleDisclaimer = "这款非官方模拟器与BANDAI NAMCO无关。"
	this.titleCopyright = "Taiko no Tatsujin ©&™ 2011 BANDAI NAMCO Entertainment Inc."
	this.categories = {
		"J-POP": "流行音乐",
		"アニメ": "卡通动画音乐",
		"ボーカロイド™曲": "VOCALOID™ Music",
		"バラエティ": "综合音乐",
		"クラシック": "古典音乐",
		"ゲームミュージック": "游戏音乐",
		"ナムコオリジナル": "NAMCO原创音乐"
	}
	this.selectSong = "选择乐曲"
	this.selectDifficulty = "选择难度"
	this.back = "返回"
	this.random = "随机"
	this.randomSong = "随机选曲"
	this.howToPlay = "操作说明"
	this.aboutSimulator = "关于模拟器"
	this.gameSettings = "游戏设定"
	this.browse = "浏览…"
	this.defaultSongList = "默认歌曲列表"
	this.songOptions = "选项"
	this.none = "无"
	this.auto = "自动"
	this.netplay = "网络对战"
	this.easy = "简单"
	this.normal = "普通"
	this.hard = "困难"
	this.oni = "魔王"
	this.songBranch = "有谱面分歧"
	this.sessionStart = "开始在线会话!"
	this.sessionEnd = "结束在线会话"
	this.loading = "加载中..."
	this.waitingForP2 = "Waiting for Another Player..."
	this.cancel = "取消"
	this.note = {
		don: "咚",
		ka: "咔",
		daiDon: "咚(大)",
		daiKa: "咔(大)",
		drumroll: "连打ー!!",
		daiDrumroll: "连打(大)ー!!",
		balloon: "气球"
	}
	this.combo = "连段"
	this.clear = "通关"
	this.good = "良"
	this.ok = "可"
	this.bad = "不可"
	this.branch = {
		"normal": "一般谱面",
		"advanced": "进阶谱面",
		"master": "达人谱面"
	}
	this.pauseOptions = [
		"继续演奏",
		"从头开始",
		"返回「选择乐曲」"
	]
	this.results = "发表成绩"
	this.points = "点"
	this.maxCombo = "最多连段数"
	this.drumroll = "连打数"
	
	this.tutorial = {
		basics: [
			"当流动的音符将与框框重叠时就用鼓棒敲打太鼓吧",
			"遇到红色音符要敲打鼓面（%s或%s）",
			"遇到蓝色音符则敲打鼓边（%s或%s）",
			"USB控制器也支持！"
		],
		otherControls: "其他控制",
		otherTutorial: [
			"%s暂停游戏",
			"选择难度时按住%s以启用自动模式",
			"选择难度时按住%s以启用网络对战模式"
		],
		ok: "确定"
	}
	this.about = {
		bugReporting: [
			"This simulator is still in development.",
			"Please report any bugs you find.",
			"You can report bugs either via our Git repository or email."
		],
		diagnosticWarning: "Be sure to include the following diagnostic data!",
		issueTemplate: "###### Describe the problem you are having below. Please include a screenshot and the diagnostic information."
	}
	this.session = {
		multiplayerSession: "Multiplayer Session",
		linkTutorial: "Share this link with your friend to start playing together! Do not leave this screen while they join.",
		cancel: "取消"
	}
	this.settings = {
		language: {
			name: "语言"
		},
		resolution: {
			name: "游戏分辨率",
			high: "高",
			medium: "中",
			low: "低",
			lowest: "最低"
		},
		touchAnimation: {
			name: "触摸动画"
		},
		keyboardSettings: {
			name: "键盘设置",
			ka_l: "边缘（左）",
			don_l: "表面（左）",
			don_r: "表面（右）",
			ka_r: "边缘（右）"
		},
		gamepadLayout: {
			name: "操作类型设定",
			a: "类型A",
			b: "类型B",
			c: "类型C"
		},
		on: "开",
		off: "关",
		default: "重置为默认值",
		ok: "确定"
	}
	this.browserSupport = {
		browserWarning: "You are running an unsupported browser (%s)",
		details: "Details...",
		failedTests: "The following tests have failed:",
		supportedBrowser: "Please use a supported browser such as %s"
	}
	this.creative = {
		creative: '创作',
		maker: '制作者'
	}
}
function StringsTw(){
	this.id = "tw"
	this.name = "正體中文"
	this.regex = /^zh-HK$|^zh-TW$/
	this.font = "Microsoft YaHei, sans-serif"
	
	this.taikoWeb = "太鼓網頁"
	this.titleProceed = "點擊或按確認！"
	this.titleDisclaimer = "這款非官方模擬器與BANDAI NAMCO無關。"
	this.titleCopyright = "Taiko no Tatsujin ©&™ 2011 BANDAI NAMCO Entertainment Inc."
	this.categories = {
		"J-POP": "流行音樂",
		"アニメ": "卡通動畫音樂",
		"ボーカロイド™曲": "VOCALOID™ Music",
		"バラエティ": "綜合音樂",
		"クラシック": "古典音樂",
		"ゲームミュージック": "遊戲音樂",
		"ナムコオリジナル": "NAMCO原創音樂"
	}
	this.selectSong = "選擇樂曲"
	this.selectDifficulty = "選擇難度"
	this.back = "返回"
	this.random = "隨機"
	this.randomSong = "隨機選曲"
	this.howToPlay = "操作說明"
	this.aboutSimulator = "關於模擬器"
	this.gameSettings = "遊戲設定"
	this.browse = "開啟檔案…"
	this.defaultSongList = "默認歌曲列表"
	this.songOptions = "選項"
	this.none = "無"
	this.auto = "自動"
	this.netplay = "網上對打"
	this.easy = "簡單"
	this.normal = "普通"
	this.hard = "困難"
	this.oni = "魔王"
	this.songBranch = "有譜面分歧"
	this.sessionStart = "開始多人模式!"
	this.sessionEnd = "結束多人模式"
	this.loading = "讀取中..."
	this.waitingForP2 = "Waiting for Another Player..."
	this.cancel = "取消"
	this.note = {
		don: "咚",
		ka: "咔",
		daiDon: "咚(大)",
		daiKa: "咔(大)",
		drumroll: "連打ー!!",
		daiDrumroll: "連打(大)ー!!",
		balloon: "氣球"
	}
	this.combo = "連段"
	this.clear = "通關"
	this.good = "良"
	this.ok = "可"
	this.bad = "不可"
	this.branch = {
		"normal": "一般譜面",
		"advanced": "進階譜面",
		"master": "達人譜面"
	}
	this.pauseOptions = [
		"繼續演奏",
		"從頭開始",
		"返回「選擇樂曲」"
	]
	this.results = "發表成績"
	this.points = "分"
	this.maxCombo = "最多連段數"
	this.drumroll = "連打數"
	
	this.tutorial = {
		basics: [
			"當流動的音符將與框框重疊時就用鼓棒敲打太鼓吧",
			"遇到紅色音符要敲打鼓面（%s或%s）",
			"遇到藍色音符則敲打鼓邊（%s或%s）",
			"USB控制器也支持！"
		],
		otherControls: "其他控制",
		otherTutorial: [
			"%s暫停遊戲",
			"選擇難度時按住%s以啟用自動模式",
			"選擇難度時按住%s以啟用網上對打模式"
		],
		ok: "確定"
	}
	this.about = {
		bugReporting: [
			"This simulator is still in development.",
			"Please report any bugs you find.",
			"You can report bugs either via our Git repository or email."
		],
		diagnosticWarning: "Be sure to include the following diagnostic data!",
		issueTemplate: "###### Describe the problem you are having below. Please include a screenshot and the diagnostic information."
	}
	this.session = {
		multiplayerSession: "Multiplayer Session",
		linkTutorial: "Share this link with your friend to start playing together! Do not leave this screen while they join.",
		cancel: "取消"
	}
	this.settings = {
		language: {
			name: "語系"
		},
		resolution: {
			name: "遊戲分辨率",
			high: "高",
			medium: "中",
			low: "低",
			lowest: "最低"
		},
		touchAnimation: {
			name: "觸摸動畫"
		},
		keyboardSettings: {
			name: "鍵盤設置",
			ka_l: "邊緣（左）",
			don_l: "表面（左）",
			don_r: "表面（右）",
			ka_r: "邊緣（右）"
		},
		gamepadLayout: {
			name: "操作類型設定",
			a: "類型A",
			b: "類型B",
			c: "類型C"
		},
		on: "開",
		off: "關",
		default: "重置為默認值",
		ok: "確定"
	}
	this.browserSupport = {
		browserWarning: "You are running an unsupported browser (%s)",
		details: "Details...",
		failedTests: "The following tests have failed:",
		supportedBrowser: "Please use a supported browser such as %s"
	}
	this.creative = {
		creative: '創作',
		maker: '製作者'
	}
}
function StringsKo(){
	this.id = "ko"
	this.name = "한국어"
	this.regex = /^ko$|^ko-/
	this.font = "Microsoft YaHei, sans-serif"
	
	this.taikoWeb = "태고 웹"
	this.titleProceed = "클릭하거나 Enter를 누릅니다!"
	this.titleDisclaimer = "이 비공식 시뮬레이터는 반다이 남코와 관련이 없습니다."
	this.titleCopyright = "Taiko no Tatsujin ©&™ 2011 BANDAI NAMCO Entertainment Inc."
	this.categories = {
		"J-POP": "POP",
		"アニメ": "애니메이션",
		"ボーカロイド™曲": "VOCALOID™ Music",
		"バラエティ": "버라이어티",
		"クラシック": "클래식",
		"ゲームミュージック": "게임",
		"ナムコオリジナル": "남코 오리지널"
	}
	this.selectSong = "곡 선택"
	this.selectDifficulty = "난이도 선택"
	this.back = "돌아간다"
	this.random = "랜덤"
	this.randomSong = "랜덤"
	this.howToPlay = "지도 시간"
	this.aboutSimulator = "게임 정보"
	this.gameSettings = "게임 설정"
	this.browse = "찾아보기…"
	this.defaultSongList = "기본 노래 목록"
	this.songOptions = "옵션"
	this.none = "없음"
	this.auto = "오토"
	this.netplay = "넷 플레이"
	this.easy = "쉬움"
	this.normal = "보통"
	this.hard = "어려움"
	this.oni = "귀신"
	this.songBranch = "악보 분기 있습니다"
	this.sessionStart = "온라인 세션 시작!"
	this.sessionEnd = "온라인 세션 끝내기"
	this.loading = "로딩 중..."
	this.waitingForP2 = "Waiting for Another Player..."
	this.cancel = "취소"
	this.note = {
		don: "쿵",
		ka: "딱",
		daiDon: "쿵(대)",
		daiKa: "딱(대)",
		drumroll: "연타ー!!",
		daiDrumroll: "연타(대)ー!!",
		balloon: "풍선"
	}
	this.combo = "콤보"
	this.clear = "클리어"
	this.good = "얼쑤"
	this.ok = "좋다"
	this.bad = "에구"
	this.branch = {
		"normal": "보통 악보",
		"advanced": "현인 악보",
		"master": "달인 악보"
	}
	this.pauseOptions = [
		"연주 계속하기",
		"처음부터 다시",
		"「곡 선택」으로"
	]
	this.results = "성적 발표"
	this.points = "점"
	this.maxCombo = "최대 콤보 수"
	this.drumroll = "연타 횟수"
	
	this.tutorial = {
		basics: [
			"이동하는 음표가 테두리와 겹쳐졌을 때 북채로 태고를 두드리자！",
			"빨간 음표는 면을 두드리자 (%s 또는 %s)",
			"파란 음표는 테를 두드리자 (%s 또는 %s)",
			"USB 컨트롤러도 지원됩니다!"
		],
		otherControls: "기타 컨트롤",
		otherTutorial: [
			"%s \u2014 게임을 일시 중지합니다",
			"난이도 선택 동안 %s 홀드 \u2014 오토 모드 활성화",
			"난이도 선택 동안 %s 홀드 \u2014 넷 플레이 모드 활성화"
		],
		ok: "확인"
	}
	this.about = {
		bugReporting: [
			"This simulator is still in development.",
			"Please report any bugs you find.",
			"You can report bugs either via our Git repository or email."
		],
		diagnosticWarning: "Be sure to include the following diagnostic data!",
		issueTemplate: "###### Describe the problem you are having below. Please include a screenshot and the diagnostic information."
	}
	this.session = {
		multiplayerSession: "Multiplayer Session",
		linkTutorial: "Share this link with your friend to start playing together! Do not leave this screen while they join.",
		cancel: "취소"
	}
	this.settings = {
		language: {
			name: "언어"
		},
		resolution: {
			name: "게임 해상도",
			high: "높은",
			medium: "중간",
			low: "저",
			lowest: "최저"
		},
		touchAnimation: {
			name: "터치 애니메이션"
		},
		keyboardSettings: {
			name: "키보드 설정",
			ka_l: "가장자리 (왼쪽)",
			don_l: "표면 (왼쪽)",
			don_r: "표면 (오른쪽)",
			ka_r: "가장자리 (오른쪽)"
		},
		gamepadLayout: {
			name: "조작 타입 설정",
			a: "타입 A",
			b: "타입 B",
			c: "타입 C"
		},
		on: "온",
		off: "오프",
		default: "기본값으로 재설정",
		ok: "확인"
	}
	this.browserSupport = {
		browserWarning: "You are running an unsupported browser (%s)",
		details: "Details...",
		failedTests: "The following tests have failed:",
		supportedBrowser: "Please use a supported browser such as %s"
	}
	this.creative = {
		creative: '창작',
		maker: '만드는 사람'
	}
}
var allStrings = {
	"ja": new StringsJa(),
	"en": new StringsEn(),
	"cn": new StringsCn(),
	"tw": new StringsTw(),
	"ko": new StringsKo()
}
