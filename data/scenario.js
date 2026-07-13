window.FARM_VILLAGE_SCENARIO = {
  "title": "이세계 팜빌리지 : 영지개척기",
  "titleImage": "./assets/title-farm-village.png",
  "assets": {
    "backgrounds": {
      "comic_intro": "./assets/comic-intro.png",
      "field": "./assets/bg-isometric-farm.png",
      "dining": "./assets/bg-dining.png",
      "bg": "./assets/bg-wall.png",
      "bg_2": "./assets/bg-storage.png",
      "cleanwell": "./assets/bg-cleanwell.png"
    },
    "characters": {
      "lord": "./assets/char-lord-sheet.png",
      "liddy": "./assets/char-liddy-sheet.png",
      "max": "./assets/char-max-sheet.png",
      "gallion": "./assets/char-gallion-sheet.png",
      "sebastian": "./assets/char-sebastian-sheet.png",
      "ethan": "./assets/char-ethan-sheet.png"
    }
  },
  "characters": {
    "lord": {
      "name": "주인공",
      "note": "지하철 사고 뒤 성수힐 영지의 후계자로 눈을 뜬 주인공. 아직 모든 것이 낯설다."
    },
    "liddy": {
      "name": "리디",
      "note": "영주가의 마지막 하녀. 툴툴대지만 누구보다 먼저 주인공을 챙긴다."
    },
    "max": {
      "name": "맥스",
      "note": "빵을 투석기 탄환처럼 보는 대장장이. 무뚝뚝하지만 손재주는 확실하다."
    },
    "gallion": {
      "name": "갈리온",
      "note": "기억은 흐릿하지만 전장을 지나온 눈빛만은 또렷한 전투 마법사. "
    },
    "sebastian": {
      "name": "세바스찬",
      "note": "무너지는 영지의 품격을 마지막까지 붙들고 있는 집사."
    },
    "ethan": {
      "name": "에단",
      "note": "제국상사의 상인. 웃는 얼굴로 가장 냉정한 계산을 끝낸다."
    }
  },
  "quests": {
    "intro": {
      "title": "낯선 아침",
      "steps": [
        "밭에서 깨어남",
        "리디와 대화",
        "식당으로 이동"
      ]
    },
    "food": {
      "title": "초라한 식탁",
      "steps": [
        "식탁 확인",
        "주민 파악",
        "식량 위기 확인"
      ]
    },
    "contract": {
      "title": "첫 수확 계약",
      "steps": [
        "에단과 대면",
        "담보 제안",
        "농사 준비"
      ]
    },
    "well": {
      "title": "우물을 복원하자",
      "steps": [
        "일 시키기",
        "복원하기"
      ]
    }
  },
  "start": "scene_001",
  "nodes": {
    "scene_001": {
      "quest": "intro",
      "progress": 0,
      "speaker": "주인공",
      "text": "응?\n...잠깐.\n내가 왜 밭을 갈고 있었지?\n손이 흙투성이네.\n이 괭이는 또 뭐야. 옷도 다 낡았잖아.\n아... 머리가 깨질 것 같아.\n조금 전까지 분명 지하철이었는데.\n누군가 선로로 떨어졌고.\n사람들이 소리쳤고.\n...\n빛. 엄청 밝은 빛.\n그리고 여기?\n난 누구지?",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        }
      ],
      "next": "scene_002",
      "bg": "field",
      "effects": [
        {
          "type": "quest",
          "quest": "intro",
          "step": 0,
          "label": "퀘스트 진행"
        }
      ],
      "memo": ""
    },
    "scene_002": {
      "progress": 1,
      "speaker": "리디",
      "text": "여, 영주님!!\n다행이다!\n또 멍하니 계신 줄 알았어요!",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ],
      "next": "scene_003"
    },
    "scene_003": {
      "speaker": "주인공",
      "text": "...영주님?\n나를 부른 거야?\n난 누구? 여긴 어디?",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ],
      "next": "scene_004"
    },
    "scene_004": {
      "speaker": "리디",
      "text": "영주님, 잠이 덜 깼나봐요. \n여긴 [영지이름] 영지잖아요. \n영주님이 먹여 살려야 할.",
      "next": "scene_005",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ],
      "territoryInput": true
    },
    "scene_005": {
      "progress": 2,
      "speaker": "리디",
      "text": "영주님. 이젠 무서울려고 해요. \n평소 영주님이 백치미가 있었지만, 이정도는 아니였는데.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ],
      "choices": [
        {
          "text": "너는 누구야?",
          "next": "scene_006"
        },
        {
          "text": "영주라니?",
          "next": "scene_074"
        }
      ]
    },
    "scene_006": {
      "speaker": "리디",
      "text": "저는 리디예요.\n영주가의 마지막 하녀.\n제 이름도 잊어버리신 거예요?",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ],
      "effects": [
        {
          "type": "affection",
          "character": "liddy",
          "amount": 1,
          "label": "리디 호감도 +1"
        }
      ],
      "next": "scene_007"
    },
    "scene_007": {
      "speaker": "리디",
      "text": "됐어요. \n지금은 그보다 중요한 일이 있어요.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ],
      "next": "scene_008"
    },
    "scene_008": {
      "speaker": "주인공",
      "text": "...? 무슨?",
      "next": "scene_009",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ]
    },
    "scene_009": {
      "speaker": "리디",
      "text": "아침부터 밭도 갈았잖아요.\n이제 밥 먹으러 가요.",
      "next": "scene_010",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ]
    },
    "scene_010": {
      "speaker": "주인공",
      "text": "...\n밥. 중요하지. ",
      "next": "scene_011",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ]
    },
    "scene_011": {
      "speaker": "리디",
      "text": "오늘도 별건 없지만.\n안 먹으면 더 일 못 하잖아요. ",
      "next": "scene_012",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ]
    },
    "scene_012": {
      "speaker": "주인공",
      "text": "밭, 영주, 가난한 영지.\n무너진 울타리.\n잡초가 가득한 밭.\n멀리 보이는 허름한 저택.\n도대체 무슨 상황인 거야?\n... 꿈은 아닌 것 같네.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ],
      "next": "scene_013"
    },
    "scene_013": {
      "speaker": "리디",
      "text": "영주님!\n고민은 밥 먹고 하세요. \n식으면 더 맛없어요.",
      "next": "scene_014",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ]
    },
    "scene_014": {
      "speaker": "주인공",
      "text": "...\n일단 따라가 보자.",
      "next": "scene_015",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ]
    },
    "scene_015": {
      "bg": "dining",
      "quest": "food",
      "progress": 0,
      "speaker": "주인공",
      "text": "헐. 여기 식당이 맞아? \n빵 네 조각에 묽은 스프. \n설마, 이게 아침 식사? 난 영주라며?\n빵도 네 조각인데, 사람은 다섯 명이면, 한 명은 굶으라는 건가?\n매일 욕하던 우리 회사 구내식당은 빕구루망이였네. \n환생했더니, 영주? \n좋아. 여기까지는 나에겐 꽤 익숙한 전개야.  \n문제는, 하필 망해가는 영지라니.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ],
      "next": "scene_016"
    },
    "scene_016": {
      "speaker": "리디",
      "text": "쉿. 다들 듣고 있어요.\n오늘도 별건 없지만 안 먹으면 더 일 못 하잖아요.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ],
      "next": "scene_017"
    },
    "scene_017": {
      "progress": 1,
      "speaker": "주인공",
      "text": "저 사람들은 누구지?\n기억이 안 난다고 말하면 더 큰일 날 것 같은데.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        }
      ],
      "choices": [
        {
          "text": "맥스에게 말을 건다",
          "next": "scene_018",
          "hideIfFlag": "met_max"
        },
        {
          "text": "갈리온에게 말을 건다",
          "next": "scene_023",
          "hideIfFlag": "met_gallion"
        },
        {
          "text": "세바스찬에게 말을 건다",
          "next": "scene_027",
          "hideIfFlag": "met_sebastian"
        }
      ],
      "next": "scene_029",
      "autoNextWhenChoicesDone": true
    },
    "scene_018": {
      "speaker": "맥스",
      "text": "...좋군.\n오늘도 이 빵은 투석기 탄환으로 쓸 수 있겠어.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "max",
          "position": "right"
        }
      ],
      "effects": [
        {
          "type": "affection",
          "character": "max",
          "amount": 1,
          "label": "맥스 호감도 +1"
        },
        {
          "type": "flag",
          "key": "met_max",
          "value": true
        }
      ],
      "next": "scene_019",
      "autoNextWhenChoicesDone": true
    },
    "scene_019": {
      "speaker": "리디",
      "text": "맥스 아저씨.\n먹는 걸로 장난치지 마세요.",
      "next": "scene_020",
      "characters": [
        {
          "id": "liddy",
          "position": "left"
        },
        {
          "id": "max",
          "position": "right"
        }
      ]
    },
    "scene_020": {
      "speaker": "맥스",
      "text": "...장난 아닌데.\n정말 이 빵을 투석기로 날리면 마왕군 놈들 뚝배기를 뽀갤 수 있을 것 같단 말이지.\n...진짜루.",
      "next": "scene_021",
      "characters": [
        {
          "id": "liddy",
          "position": "left"
        },
        {
          "id": "max",
          "position": "right"
        }
      ]
    },
    "scene_021": {
      "speaker": "리디",
      "text": "...안 됩니다. \n마지막 빵일 수도 있어요.",
      "next": "scene_022",
      "characters": [
        {
          "id": "liddy",
          "position": "left"
        },
        {
          "id": "max",
          "position": "right"
        }
      ]
    },
    "scene_022": {
      "speaker": "주인공",
      "text": "...\n손이 망치 같다. \n저 딱딱한 빵을 찢어 먹는 강인한 턱!\n저 사람이 대장장이인가.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "max",
          "position": "right"
        }
      ],
      "next": "scene_017"
    },
    "scene_023": {
      "speaker": "갈리온",
      "text": "...\n으음...\n... 으으음...\n마왕군!?\n벌써 성문까지 왔는가? 메.. 메테오오~",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "gallion",
          "position": "right"
        }
      ],
      "effects": [
        {
          "type": "affection",
          "character": "gallion",
          "amount": 1,
          "label": "갈리온 호감도 +1"
        },
        {
          "type": "flag",
          "key": "met_gallion",
          "value": true
        }
      ],
      "next": "scene_024",
      "autoNextWhenChoicesDone": true
    },
    "scene_024": {
      "speaker": "리디",
      "text": "또 시작이시네요. \n엄청난 마법사셨다는 소문이 있지만, \n좀 오락가락 하세요.",
      "next": "scene_025",
      "characters": [
        {
          "id": "liddy",
          "position": "left"
        },
        {
          "id": "gallion",
          "position": "right"
        }
      ]
    },
    "scene_025": {
      "speaker": "갈리온",
      "text": "여긴.\n여긴 어디였더라?\n...\n너는?\n너는 누구더라?",
      "next": "scene_026",
      "characters": [
        {
          "id": "liddy",
          "position": "left"
        },
        {
          "id": "gallion",
          "position": "right"
        }
      ]
    },
    "scene_026": {
      "speaker": "주인공",
      "text": "...\n정신이 오락가락한다.\n그런데, 눈빛만큼은 결코 평범하지 않아. \n[영지이름]에는 사연 있는 사람이 너무 많네.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "gallion",
          "position": "right"
        }
      ],
      "next": "scene_017"
    },
    "scene_027": {
      "speaker": "세바스찬",
      "text": "좋은 아침입니다, 영주님.\n의자가 흔들리더군요. 지금 조여 두었습니다.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "sebastian",
          "position": "right"
        }
      ],
      "effects": [
        {
          "type": "affection",
          "character": "sebastian",
          "amount": 1,
          "label": "세바스찬 호감도 +1"
        },
        {
          "type": "flag",
          "key": "met_sebastian",
          "value": true
        }
      ],
      "next": "scene_028"
    },
    "scene_028": {
      "speaker": "주인공",
      "text": "우오옷~! 저 손놀림!\n프로다.\n이런 사람은 평생 집사만 했을 리가 없는데.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "sebastian",
          "position": "right"
        }
      ],
      "next": "scene_017"
    },
    "scene_029": {
      "speaker": "주인공",
      "text": "(아무래도 이곳의 상황을 더 파악해야 겠어.)\n리디, 나 잠깐 주위 좀 둘러보고 올게.",
      "next": "scene_081",
      "progress": 2,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ],
      "choices": [
        {
          "text": "밭 조사",
          "next": "scene_030",
          "hideIfFlag": "done_scene_061"
        },
        {
          "text": "우물 조사",
          "next": "scene_031",
          "hideIfFlag": "done_scene_060"
        },
        {
          "text": "창고 조사",
          "next": "scene_032",
          "hideIfFlag": "done_scene_063"
        }
      ],
      "autoNextWhenChoicesDone": true,
      "bg": "field",
      "memo": "주위탐험 밭, 우물, 창고조사 분기"
    },
    "scene_030": {
      "speaker": "주인공",
      "text": "정말 매마른 밭이구나. \n여기선 뭘 심어도 안자랄 것 같은데... \n난, 아니 이 몸은 왜 이따위 밭을 갈고 있던걸까?",
      "next": "scene_029",
      "progress": 2,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        }
      ],
      "effects": [
        {
          "type": "flag",
          "key": "done_scene_061",
          "value": true
        }
      ]
    },
    "scene_031": {
      "speaker": "주인공",
      "text": "이게... 우물? \n허물어져 있는데? 누가 일부러 막아 놓은 것 같기도...\n뭔가 수상한데?",
      "next": "scene_029",
      "progress": 2,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        }
      ],
      "bg": "bg",
      "effects": [
        {
          "type": "flag",
          "key": "done_scene_060",
          "value": true
        }
      ]
    },
    "scene_032": {
      "speaker": "주인공",
      "text": "창고라... 마지 좀비떼의 습격을 받은 편의점 같구나. \n암것도 없단 소리지. \n이렇게 척박한 땅에 뭔 창고까지 필요했을까?\n음? 벽 틈에 이건 뭐지...? \n장부인가? (응? 읽을 수 있어!?)\n북방수비대에게 검 1천개, 화포 30문, 말 200필을 보냈다라... \n뭔가 이상한대? 이 곳. 예전엔 북방 수비의 중심지였던거 아냐? 지금은 폐허만 남았지만.",
      "progress": 2,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        }
      ],
      "next": "scene_029",
      "effects": [
        {
          "type": "flag",
          "key": "done_scene_063",
          "value": true
        }
      ],
      "bg": "bg_2"
    },
    "scene_081": {
      "speaker": "주인공",
      "text": "그러고 보니 좀 수상한데? \n이정도면 다들 떠나야 하는데. 집사, 하녀에 대장장이. 그리고 마법사까지... 뭔가 비밀이 있나?",
      "next": "scene_033",
      "progress": 2,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        }
      ],
      "memo": "뭔가 비밀이 있나?"
    },
    "scene_033": {
      "speaker": "주인공",
      "text": "흠! 뭔가 테스터의 본능을 일깨우는 냄새가 난다. \n버그의 냄새! 이 영지. 뭔가 잘못돼 있어. \n그냥 빤쓰 찢어지게 가난하기만 한 영지가 아니야.",
      "progress": 2,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        }
      ],
      "next": "scene_034",
      "bg": "field",
      "memo": "이영지. 뭔가 잘못돼 있어."
    },
    "scene_034": {
      "speaker": "주인공",
      "text": "하지만, 그게 뭐. 당장 먹을게 없으니. (샤갈)\n물 배라도 채우려면 우물부터 복원해야겠어. \n우물을 복원하자!\n\n",
      "next": "scene_035",
      "progress": 2,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        }
      ]
    },
    "scene_035": {
      "speaker": "주인공",
      "text": "우물을 막고 있는 가고일이라... 뭔가 그로테스크하군. \n그런데, 이걸 어떻게 치우나...아?\n글지. 난 영주잖아. 가신들에게 시키면 되지.",
      "next": "scene_036",
      "progress": 0,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        }
      ],
      "bg": "bg",
      "quest": "well",
      "memo": "우물복원 퀘스트 시작"
    },
    "scene_036": {
      "speaker": "주인공",
      "text": "누구에게 명령.. 아니 부탁을 할까?",
      "progress": 0,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        }
      ],
      "choices": [
        {
          "text": "갈리온",
          "next": "scene_037",
          "hideIfFlag": "갈리온"
        },
        {
          "text": "맥스",
          "next": "scene_067"
        }
      ],
      "memo": "우물복원 누구에게 시킬까"
    },
    "scene_037": {
      "speaker": "주인공",
      "text": "갈리온 할아범. 이 우물을 막고 있는 저 석상을 치워 줄 수 있어?",
      "progress": 0,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "gallion",
          "position": "right"
        }
      ],
      "effects": [
        {
          "type": "flag",
          "key": "갈리온",
          "value": true
        }
      ],
      "next": "scene_038",
      "memo": "갈리온에게 우물복원 부탁"
    },
    "scene_038": {
      "speaker": "갈리온",
      "text": "배고파... 배가 고파하...\n엉? 넌 누구? 난 배고픈 불쌍한 마법사. ",
      "next": "scene_039",
      "progress": 0,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "gallion",
          "position": "right"
        }
      ]
    },
    "scene_039": {
      "speaker": "주인공",
      "text": "(또 오락가락 하는군.)\n할배! 정신차려! 저 우물을 막고 있는 걸 없애야 식량을 경작해서 배불리 먹을 거 아냐?! ",
      "next": "scene_040",
      "progress": 0,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "gallion",
          "position": "right"
        }
      ]
    },
    "scene_040": {
      "speaker": "갈리온",
      "text": "배.불.리? (번쩍!)\n오옷! 영주님! 오랜만입니다! 저 우물을 막고 있는 마왕군의 하늘의 무법자 가고일을 없애버리란 말씀이십니까? \n 이 갈리온 더 레전트 2세! 북방 국경 수비대의 최고 존엄을 모시는 최고 전투 마법사! 영주님의 명을 받드옵니다! \n(쭈앙~) 매직 미싸일!",
      "next": "scene_041",
      "progress": 0,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "gallion",
          "position": "right"
        }
      ]
    },
    "scene_041": {
      "speaker": "주인공",
      "text": "(쿠앙~!!) \n쿨럭, 쿨럭. 와우. 뭐, 뭔일이야? 갑자기!\n할아범! 방언 터졌어? 뭐? 뭐라고? 아 북방 머 머라고 막 했는데?\n어? 오오오오 우물에 물이 찼어!",
      "next": "scene_042",
      "progress": 1,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "gallion",
          "position": "right"
        }
      ],
      "bg": "cleanwell",
      "memo": "갈리온 우물 복원 성공"
    },
    "scene_042": {
      "speaker": "갈리온",
      "text": "...네? \n뭐.. 뭐라고? 어? 물.. 물.. \n난 누구? 넌 .. 영주?",
      "next": "scene_043",
      "bg": "cleanwell",
      "progress": 2,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "gallion",
          "position": "right"
        }
      ]
    },
    "scene_043": {
      "speaker": "주인공",
      "text": "하.. 할아범. (또...)\n암튼 수고했어. 할아범. 와 정말 대단해요. \n언능 쾌차하길 바라.",
      "next": "scene_075",
      "bg": "cleanwell",
      "progress": 2,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "gallion",
          "position": "right"
        }
      ]
    },
    "scene_075": {
      "speaker": "주인공",
      "text": "야~ 우물에서 물이 퐁퐁~ 좋아 좋아",
      "progress": 1,
      "characters": [
        {
          "id": "lord",
          "position": "center"
        }
      ],
      "memo": "우물복원 클리어",
      "bg": "cleanwell",
      "next": "scene_044"
    },
    "scene_044": {
      "progress": 0,
      "speaker": "리디",
      "text": "영주님. 큰일이에요.\n에단님이 갑자기 오셨어요! \n",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ],
      "next": "scene_045",
      "quest": "contract"
    },
    "scene_045": {
      "speaker": "주인공",
      "text": "에단? 에단이 누구지?\n다른 가신이 또 있었나? ",
      "next": "scene_046",
      "progress": 0,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ],
      "autoNextWhenChoicesDone": true,
      "memo": "에단은 누구?"
    },
    "scene_046": {
      "quest": "contract",
      "progress": 0,
      "speaker": "에단",
      "text": "영주님. 오랜만입니다.\n리디, 영주님 상태가 왜 이렇지?\n드디어 현실을 받아들이신 건가?",
      "characters": [
        {
          "id": "liddy",
          "position": "left"
        },
        {
          "id": "ethan",
          "position": "right"
        }
      ],
      "next": "scene_047",
      "memo": "에단등장"
    },
    "scene_080": {
      "speaker": "화면",
      "text": "새 장면입니다.",
      "next": ""
    },
    "scene_067": {
      "speaker": "주인공",
      "text": "맥스 ! 이 우물을 다시 사용해야 하는데, 이 석상들을 없앨 방법이 없을까?",
      "progress": 0,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "max",
          "position": "right"
        }
      ],
      "next": "scene_068",
      "memo": "맥스에게 우물복원 부탁"
    },
    "scene_068": {
      "speaker": "맥스",
      "text": "하, 영주님. 지금 이 맥스에게 요런 우물 잔해나 파해치란 말씀이십니까?",
      "next": "scene_069",
      "progress": 0,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "max",
          "position": "right"
        }
      ],
      "memo": "맥스 우물"
    },
    "scene_069": {
      "speaker": "주인공",
      "text": "아, 맥스. 많이 바쁘구나? \n뭐 만들거나 수리할 게 있나봐?",
      "next": "scene_070",
      "progress": 0,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "max",
          "position": "right"
        }
      ]
    },
    "scene_070": {
      "speaker": "맥스",
      "text": "아. 아닙니다. 영주님. \n지금 먹을 것도 없는데, 쇠붙이로 뭐 만들게 있을리가?\n한번에 네 알겠쯈다! 하면 좀 그래서 튕겨봤습니다.",
      "next": "scene_071",
      "progress": 0,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "max",
          "position": "right"
        }
      ]
    },
    "scene_071": {
      "speaker": "주인공",
      "text": "(하아. 이 아저씨 쉽지 않네.)\n맥스? 우물, 도와 줄거지?",
      "next": "scene_072",
      "progress": 0,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "max",
          "position": "right"
        }
      ]
    },
    "scene_072": {
      "speaker": "맥스",
      "text": "네, 그럼요. 영주님. \n이 해머로 이까짓 석상 돌무더기 가루로 만들어 버리겠습니다. \n잠시 떨어져 계세요. \n크아앗~ \n(텅~)\n텅? 크아아아앗~\n(텅~)\n크앗! 흐악! 이얏! 뿌압!\n(텅~ 텅~ 텅~ 텅~)\n... 왜.. 왜 안부서지는 거야? 이거 혹시, 마력이 있는 건가?",
      "next": "scene_073",
      "progress": 0,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "max",
          "position": "right"
        }
      ]
    },
    "scene_073": {
      "speaker": "주인공",
      "text": "마력? 그럼 갈리온이 답이였나? \n맥스 아재! 실망이야. ",
      "next": "scene_037",
      "progress": 0,
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "max",
          "position": "right"
        }
      ],
      "memo": "맥스의 실패, 갈리온 부르자"
    },
    "scene_074": {
      "speaker": "리디",
      "text": "선대 영주님이 행방불명 되신 후 [영지이름] 영지의 유일한 후계자이신 영주님이... 영주님이죠.  \n오늘은 정말 이상하시네.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ],
      "effects": [
        {
          "type": "affection",
          "character": "liddy",
          "amount": 1,
          "label": "리디 호감도 +1"
        }
      ],
      "next": "scene_007"
    },
    "scene_047": {
      "speaker": "리디",
      "text": "원래도 철은 없으셨지만...\n오늘은 조금 더 이상하세요.",
      "characters": [
        {
          "id": "liddy",
          "position": "left"
        },
        {
          "id": "ethan",
          "position": "right"
        }
      ],
      "next": "scene_048"
    },
    "scene_048": {
      "speaker": "주인공",
      "text": "리디.\n그건 너무한 거 아니냐.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ],
      "next": "scene_049"
    },
    "scene_049": {
      "speaker": "에단",
      "text": "하하하하.\n..흐음. 흠.\n농담은 여기까지.\n오늘은 빚을 받으러 왔습니다.\n선대 영주께서 제국상사에서 빌려간 돈.\n오늘이 상환일입니다.\n...\n갚지 못하시면 영지는 제국상사 소유가 됩니다.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "ethan",
          "position": "right"
        }
      ],
      "next": "scene_050"
    },
    "scene_050": {
      "speaker": "주인공",
      "text": "뭐...?\n나 여기 온 지 얼마 되지도 않았는데.\n벌써 영지를 잃는다고?",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "ethan",
          "position": "right"
        }
      ],
      "choices": [
        {
          "text": "잠깐! 다른 방법은 없습니까?",
          "next": "scene_051"
        },
        {
          "text": "영지는 넘길 수 없습니다.",
          "next": "scene_064"
        }
      ]
    },
    "scene_051": {
      "speaker": "에단",
      "text": "방법은 있습니다.\n돈을 갚으시면 됩니다.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "ethan",
          "position": "right"
        }
      ],
      "next": "scene_052"
    },
    "scene_052": {
      "speaker": "주인공",
      "text": "...\n없다는 얘기잖아?",
      "next": "scene_053",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "ethan",
          "position": "right"
        }
      ]
    },
    "scene_053": {
      "progress": 1,
      "speaker": "세바스찬",
      "text": "에단님.\n담보를 하나 드리겠습니다.\n선대 영주님의 유품입니다.",
      "characters": [
        {
          "id": "sebastian",
          "position": "left"
        },
        {
          "id": "ethan",
          "position": "right"
        }
      ],
      "next": "scene_054"
    },
    "scene_054": {
      "speaker": "맥스",
      "text": "헙!\n세바스찬님! \n혹시 그 검은... 아, 안됩니다!",
      "next": "scene_055",
      "progress": 1,
      "characters": [
        {
          "id": "sebastian",
          "position": "left"
        },
        {
          "id": "max",
          "position": "right"
        }
      ]
    },
    "scene_055": {
      "speaker": "에단",
      "text": "...\n흐음...\n날이 조금 상했군요. ",
      "next": "scene_056",
      "progress": 1,
      "characters": [
        {
          "id": "ethan",
          "position": "left"
        },
        {
          "id": "max",
          "position": "right"
        }
      ]
    },
    "scene_056": {
      "speaker": "세바스찬",
      "text": "...갈면 됩니다. \n좋은 검은, 쉽게 죽지 않습니다.",
      "next": "scene_057",
      "progress": 1,
      "characters": [
        {
          "id": "ethan",
          "position": "left"
        },
        {
          "id": "sebastian",
          "position": "right"
        }
      ]
    },
    "scene_057": {
      "speaker": "주인공",
      "text": "저 검. \n엄청 소중한 물건인가 보다.",
      "next": "scene_058",
      "progress": 1,
      "characters": [
        {
          "id": "ethan",
          "position": "left"
        },
        {
          "id": "lord",
          "position": "right"
        }
      ]
    },
    "scene_058": {
      "speaker": "에단",
      "text": "좋습니다. 검은 담보로 받겠습니다.\n대신 모종과 농기구를 빌려드리죠.\n첫 수확의 절반은 제국상사 몫입니다.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "ethan",
          "position": "right"
        }
      ],
      "choices": [
        {
          "text": "알겠습니다.",
          "next": "scene_059"
        },
        {
          "text": "독한 장사꾼이네요.",
          "next": "scene_063"
        }
      ]
    },
    "scene_059": {
      "progress": 2,
      "speaker": "에단",
      "text": "좋습니다.\n계약 성립입니다.\n(좋은 불공정 계약이다.)",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "ethan",
          "position": "right"
        }
      ],
      "effects": [
        {
          "type": "quest",
          "quest": "contract",
          "step": 2,
          "label": "퀘스트 진행: 농사 준비"
        }
      ],
      "next": "scene_060"
    },
    "scene_060": {
      "bg": "field",
      "speaker": "리디",
      "text": "영주님!\n이제 농사를 시작할 수 있어요!",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ],
      "next": "scene_061",
      "memo": "에단 대화 끝. 농사를 시작"
    },
    "scene_061": {
      "speaker": "주인공",
      "text": "좋아. 농사부터 시작하자.\n살아남고, 빚을 갚고, 이 영지를 다시 세우는 거야.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "liddy",
          "position": "right"
        }
      ],
      "next": "scene_062"
    },
    "scene_062": {
      "speaker": "리디",
      "text": "영주님! 아주 의욕적인 모습, 너무 보기 좋습니다!\n어제까지는 아주 하기 싫어 돌아가실 얼굴이였는데, 오늘은 이상하게 의욕이 넘치시네요?",
      "next": "scene_062a",
      "characters": [
        {
          "id": "liddy",
          "position": "left"
        },
        {
          "id": "lord",
          "position": "right"
        }
      ],
      "memo": "이상하게 의욕이 넘치시네요?"
    },
    "scene_062a": {
      "speaker": "주인공",
      "text": "하하. 내가 그랬나? \n(정말, 이 몸의 예전 주인은 귀차니스트였군. 책임감 넘치는 테스터의 나를 보여주마.)\n난 영주니까. \n어떻게든 이 영지를 살만한 곳으로 만들어야지. \n(딱히 갈데도 없고 말야.)\n",
      "next": "scene_079",
      "characters": [
        {
          "id": "liddy",
          "position": "left"
        },
        {
          "id": "lord",
          "position": "right"
        }
      ]
    },
    "scene_063": {
      "progress": 2,
      "speaker": "에단",
      "text": "칭찬으로 듣겠습니다.\n장사꾼이니까요.",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "ethan",
          "position": "right"
        }
      ],
      "effects": [
        {
          "type": "affection",
          "character": "ethan",
          "amount": 1,
          "label": "에단 호감도 +1"
        },
        {
          "type": "quest",
          "quest": "contract",
          "step": 2,
          "label": "퀘스트 진행: 농사 준비"
        }
      ],
      "next": "scene_060"
    },
    "scene_064": {
      "speaker": "에단",
      "text": "훌륭한 각오입니다.\n하지만, 각오는 각오일 뿐. 현실은 다릅니다. \n대신 다른 담보를 제시하십시오. ",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "ethan",
          "position": "right"
        }
      ],
      "next": "scene_065"
    },
    "scene_065": {
      "speaker": "주인공",
      "text": "그럼 이 몸이라도...",
      "next": "scene_066",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "ethan",
          "position": "right"
        }
      ]
    },
    "scene_066": {
      "speaker": "에단",
      "text": "필요 없습니다! \n... 날 어찌 보고 감히! (부들부들)",
      "next": "scene_053",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "ethan",
          "position": "right"
        }
      ]
    },
    "scene_079": {
      "speaker": "리디",
      "text": "우와~ 멋있어요! 영주님! \n갑자기 사람이 변하면 죽... 아, 아니에요. \n그런데, 이 농기구는... 뭘까요? 쓰실 줄 아세요? ",
      "characters": [
        {
          "id": "liddy",
          "position": "left"
        },
        {
          "id": "lord",
          "position": "right"
        }
      ]
    }
  }
};
