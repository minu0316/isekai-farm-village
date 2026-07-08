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
      "note": "영주가의 마지막 하녀. 툴툴대지만 누구보다 먼저 로드를 챙긴다."
    },
    "max": {
      "name": "맥스",
      "note": "빵을 투석기 탄환처럼 보는 대장장이. 무뚝뚝하지만 손재주는 확실하다."
    },
    "gallion": {
      "name": "갈리온",
      "note": "기억은 흐릿하지만 전장을 지나온 눈빛만은 또렷한 노병."
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
    }
  },
  "start": "scene_001",
  "nodes": {
    "scene_001": {
      "nameInput": true,
      "quest": "intro",
      "progress": 0,
      "speaker": "주인공",
      "text": "...?\n...잠깐.\n내가...  왜 밭을 갈고 있었지?\n손이...\n... 흙투성이네.\n...이 괭이는 또 뭐야.\n...옷도. 다 낡았잖아.\n\n머리가...깨질 것 같아.\n조금 전까지...\n분명 지하철이었는데.\n누군가 선로로 떨어졌고.\n사람들이 소리쳤고.\n나는...\n...\n빛. 엄청 밝은 빛.\n그리고...\n...여기?\n대체 무슨 일이 일어난 거지?",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        }
      ],
      "next": "scene_002",
      "bg": "field"
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
      "text": "...영주님?\n나를 부른 거야?",
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
      "progress": 2,
      "speaker": "리디",
      "text": "네?\n영주님 맞잖아요.\n...잠깐. 또 기억이 이상해진 거예요?",
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
          "text": "여긴 어디지?",
          "next": "scene_005"
        },
        {
          "text": "너는 누구야?",
          "next": "scene_006"
        },
        {
          "text": "영주라니?",
          "next": "scene_007"
        }
      ]
    },
    "scene_005": {
      "speaker": "리디",
      "text": "여긴 성수힐 영지예요.\n왕국에서 제일 북쪽.\n...그리고 제일 가난한 곳이요.\n모르는 척하시는 거죠?",
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
      "next": "scene_008"
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
      "next": "scene_008"
    },
    "scene_007": {
      "speaker": "리디",
      "text": "영주님은 영주님이잖아요.\n성수힐 영지의 후계자요.\n오늘은 정말 이상하시네.",
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
      "next": "scene_008"
    },
    "scene_008": {
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
      "next": "scene_009"
    },
    "scene_009": {
      "speaker": "주인공",
      "text": "...? 무..슨?",
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
      "speaker": "리디",
      "text": "아침부터 밭도 갈았잖아요.\n이제 밥 먹으러 가요.",
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
      "speaker": "주인공",
      "text": "...",
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
      "speaker": "리디",
      "text": "오늘도 별건 없지만...\n안 먹으면 더 일 못 하잖아요. ",
      "next": "scene_013",
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
    "scene_013": {
      "speaker": "주인공",
      "text": "밭, 영주, 가난한 영지...\n도대체 무슨 상황인 거야?\n무너진 울타리.\n잡초가 가득한 밭.\n멀리 보이는 허름한 저택.\n... 꿈은 아닌 것 같네.",
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
      "next": "scene_014"
    },
    "scene_014": {
      "speaker": "리디",
      "text": "영주님!\n고민은 밥 먹고 하세요. \n식으면 더 맛없어요.",
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
      "speaker": "주인공",
      "text": "...\n일단 따라가 보자.",
      "next": "scene_016",
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
    "scene_016": {
      "bg": "dining",
      "quest": "food",
      "progress": 0,
      "speaker": "주인공",
      "text": "하아... 식당이... 맞아? \n빵 네 조각에 묽은 스프. \n설마, 이게 아침 식사? 나보고 영주라며? 이게?\n빵도 네 조각인데, 사람은 다섯 명이잖아?\n한 명은 굶으라는 건가?\n우리 회사 구내식당은 5성급이였구만?\n...환생?\n좋아. 그건 인정. \n문제는, 왜 하필 망해가는 영지인거냐?",
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
      "next": "scene_018"
    },
    "scene_018": {
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
          "next": "scene_019",
          "hideIfFlag": "met_max"
        },
        {
          "text": "갈리온에게 말을 건다",
          "next": "scene_024",
          "hideIfFlag": "met_gallion"
        },
        {
          "text": "세바스찬에게 말을 건다",
          "next": "scene_028",
          "hideIfFlag": "met_sebastian"
        }
      ],
      "next": "scene_031"
    },
    "scene_019": {
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
      "next": "scene_020"
    },
    "scene_020": {
      "speaker": "리디",
      "text": "맥스 아저씨.\n먹는 걸로 장난치지 마세요.",
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
      "speaker": "맥스",
      "text": "...장난 아닌데.\n정말 이 빵을 투석기로 날리면 마왕군 놈들 뚝배기를 뽀갤 수 있을 것 같단 말이지.\n...진짜루.",
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
      "speaker": "리디",
      "text": "...안 됩니다. \n마지막 빵일 수도 있어요.",
      "next": "scene_023",
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
    "scene_023": {
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
      "next": "scene_018"
    },
    "scene_024": {
      "speaker": "갈리온",
      "text": "...\n으음...\n... 으으음...\n...마왕군.\n...벌써 성문까지 왔는가.",
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
      "next": "scene_025"
    },
    "scene_025": {
      "speaker": "리디",
      "text": "또 시작이시네요. \n엄청난 마법사셨다는 소문이 있지만, \n좀 오락가락 하세요.",
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
      "speaker": "리디",
      "text": "...여긴.\n...여긴 어디였더라?\n...\n너는?\n...너는 누구더라?",
      "next": "scene_027",
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
    "scene_027": {
      "speaker": "주인공",
      "text": "...\n정신이 오락가락한다.\n그런데, 눈빛만큼은 결코 평범하지 않아. \n성수힐에는 사연 있는 사람이 너무 많네.",
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
      "next": "scene_018"
    },
    "scene_028": {
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
      "next": "scene_029"
    },
    "scene_029": {
      "speaker": "주인공",
      "text": "프로다.\n이런 사람은 평생 집사만 했을 리가 없는데.",
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
      "next": "scene_018"
    },
    "scene_030": {
      "speaker": "세바스찬",
      "text": "...(씨익)",
      "next": "scene_018",
      "characters": [
        {
          "id": "lord",
          "position": "left"
        },
        {
          "id": "sebastian",
          "position": "right"
        }
      ]
    },
    "scene_031": {
      "progress": 2,
      "speaker": "리디",
      "text": "영주님. 큰일이에요.\n식량이... 오늘까지만 버틸 것 같아요.\n",
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
      "next": "scene_032"
    },
    "scene_032": {
      "speaker": "주인공",
      "text": "...잠깐.\n생각보다 훨씬 심각하잖아?\n나 여기 온 지 두 시간도 안 됐는데.\n하아... 나 괜찮은 걸까?",
      "next": "scene_033",
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
      ]
    },
    "scene_033": {
      "speaker": "리디",
      "text": "그래도...\n방법은 있습니다, 영주님!",
      "next": "",
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
          "text": "무슨 방법인데?",
          "next": "scene_034"
        },
        {
          "text": "설마 나보고 해결하라는 거야?",
          "next": "scene_035"
        }
      ]
    },
    "scene_034": {
      "speaker": "리디",
      "text": "제국상사에서 밀 모종을 빌려와야 해요.\n안 그러면 이번 농사는 끝이에요.",
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
      "next": "scene_037"
    },
    "scene_035": {
      "speaker": "리디",
      "text": "...영주님이잖아요.\n제가 가면 안 빌려줘요.\n그리고 전... 말도 잘 못하고.",
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
      "next": "scene_036"
    },
    "scene_036": {
      "speaker": "주인공",
      "text": "...\n반박을 못 하겠네.",
      "next": "scene_037",
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
    "scene_037": {
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
      "next": "scene_038"
    },
    "scene_038": {
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
      "next": "scene_039"
    },
    "scene_039": {
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
      "next": "scene_040"
    },
    "scene_040": {
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
      "next": "scene_054"
    },
    "scene_041": {
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
      "next": "scene_042"
    },
    "scene_042": {
      "speaker": "주인공",
      "text": "...\n없다는 얘기잖아?",
      "next": "scene_044",
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
    "scene_043": {
      "speaker": "에단",
      "text": "훌륭한 각오입니다.\n그럼 숫자로 증명하셔야겠군요.",
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
      "next": "scene_044"
    },
    "scene_044": {
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
      "next": "scene_045"
    },
    "scene_045": {
      "speaker": "맥스",
      "text": "헙!\n세바스찬님! \n혹시 그 검은... 아, 안됩니다!",
      "next": "scene_046",
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
    "scene_046": {
      "speaker": "에단",
      "text": "...\n흐음...\n날이 조금 상했군요. ",
      "next": "scene_047",
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
    "scene_047": {
      "speaker": "세바스찬",
      "text": "...갈면 됩니다. \n좋은 검은, 쉽게 죽지 않습니다.",
      "next": "scene_048",
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
    "scene_048": {
      "speaker": "주인공",
      "text": "저 검. \n엄청 소중한 물건인가 보다.",
      "next": "scene_049",
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
    "scene_049": {
      "speaker": "에단",
      "text": "좋습니다. 검은 담보로 받겠습니다.\n대신 밀 모종과 농기구를 빌려드리죠.\n첫 수확의 절반은 제국상사 몫입니다.",
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
          "next": "scene_050"
        },
        {
          "text": "독한 장사꾼이네요.",
          "next": "scene_051"
        }
      ]
    },
    "scene_050": {
      "progress": 2,
      "speaker": "에단",
      "text": "좋습니다.\n계약 성립입니다.",
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
      "next": "scene_052"
    },
    "scene_051": {
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
      "next": "scene_052"
    },
    "scene_052": {
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
      "next": "scene_053"
    },
    "scene_053": {
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
      "choices": [
        {
          "text": "처음부터 다시 보기",
          "next": "scene_001",
          "reset": true
        },
        {
          "text": "대화 로그 보기",
          "action": "openLog"
        }
      ]
    },
    "scene_054": {
      "speaker": "주인공",
      "text": "뭐...?\n나 여기 온 지 두시간.\n벌써 영지를 잃는다고?",
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
          "next": "scene_041"
        },
        {
          "text": "영지는 넘길 수 없습니다.",
          "next": "scene_043"
        }
      ]
    }
  }
};
