var SampleBoardAndCards1 = {
  "id": 1,
  "board": {
    "id": "1",
    "stages": [
      {
        "name": "需求",
        "wip": "∞"
      },
      {
        "name": "确认",
        "wip": "4"
      },
      {
        "name": "开发",
        "wip": 8,
        "board": {
          "id": "3",
          "stages": [
            {
              "name": "开发中",
              "wip": 2,
              "isChildShown": true,
              "lanes": [
                {
                  "name": "前端",
                  "fieldName": "分层"
                },
                {
                  "name": "后端",
                  "fieldName": "分层",
                  "isDefault": true
                }
              ]
            },
            {
              "name": "STG测试",
              "wip": 2
            },
            {
              "name": "STG测试完",
              "wip": 2
            }
          ]
        }
      },
      {
        "name": "测试",
        "wip": 6
      },
      {
        "name": "验收",
        "wip": 6
      },
      {
        "name": "完成",
        "wip": "∞"
      }
    ],
    "lanes": [
      {
        "name": "Expedite",
        "fieldName": "priority"
      },
      {
        "name": "Normal",
        "fieldName": "priority",
        "isDefault": true,
        "lane": {
          "name": "Apple",
          "isDefault": true,
          "fieldName": "customer"
        }
      },
      {
        "name": "Normal",
        "fieldName": "priority",
        "isDefault": true,
        "lane": {
          "name": "Amazon",
          "fieldName": "customer"
        }
      }
    ]
  },
  "cards": [
    {
      "id": 1,
      "name": "ST001",
      "owner": "winnie",
      "isCompleted": true,
      "desc": "潜在客户需求收集",
      "customer": "Apple",
      "priority": "Expedite",
      "kanbanStages": {
        "1": {
          "stage": "确认"
        }
      }
    },
    {
      "id": 2,
      "name": "ST002",
      "desc": "Kanban 工具开发",
      "owner": "ken",
      "customer": "Amazon",
      "priority": "Normal",
      "kanbanStages": {
        "1": {
          "stage": "开发"
        },
        "3": {
          "stage": "开发中"
        }
      },
      "childs": [
        {
          "id": 3,
          "name": "TA0001",
          "desc": "UI Proto",
          "owner": "ken",
          "分层": "前端",
          "parent": 2
        },
        {
          "id": 4,
          "name": "TA0002",
          "blocked": true,
          "desc": "根据 Kanban 特点, 进行 Board 和 Card 的数据建模",
          "owner": "sam",
          "分层": "后端",
          "parent": 2
        },
        {
          "id": 5,
          "name": "TA0003",
          "desc": "美工",
          "owner": "winnie",
          "分层": "前端",
          "parent": 2
        }
      ]
    },
    {
      "id": 5,
      "name": "ST003",
      "desc": "CFD 报表生成",
      "owner": "sam",
      "priority": "Normal",
      "customer": "Apple",
      "kanbanStages": {
        "1": {
          "stage": "开发"
        },
        "3": {
          "stage": "STG测试"
        }
      },
      "parent": 2
    },
    {
      "id": 3,
      "name": "ST004",
      "desc": "Control 报表生成",
      "owner": "winnie",
      "isCompleted": true,
      "priority": "Normal",
      "customer": "Apple",
      "kanbanStages": {
        "1": {
          "stage": "开发"
        },
        "3": {
          "stage": "STG测试完"
        }
      },
      "childs": [
        {
          "id": 4,
          "name": "季度报表生成",
          "desc": "根据实际案例建模",
          "owner": "winnie",
          "isCompleted": true,
          "分层": "后端",
          "parent": 3
        }
      ]
    }
  ]
};

var SampleBoardAndCards2 = {
  "id": 2,
  "board": {
    "id": "1",
    "stages": [
      {
        "name": "提出",
        "wip": "∞"
      },
      {
        "name": "确认",
        "wip": "6"
      },
      {
        "name": "业务分析",
        "wip": "6"
      },
      {
        "name": "待开发",
        "wip": "3"
      },
      {
        "name": "开发",
        "wip": 6,
        "board": {
          "id": "3",
          "stages": [
            {
              "name": "进行中",
              "wip": 2
            },
            {
              "name": "自测",
              "wip": 2
            },
            {
              "name": "完成",
              "wip": 2
            }
          ]
        }
      },
      {
        "name": "测试",
        "wip": 6
      },
      {
        "name": "待UAT",
        "wip": 6
      },
      {
        "name": "UAT",
        "wip": 4
      },
      {
        "name": "发布",
        "wip": "∞"
      }
    ],
    "lanes": [
      {
        "name": "Expedite",
        "fieldName": "priority"
      },
      {
        "name": "Normal",
        "isDefault": true,
        "fieldName": "priority"
      },
      {
        "name": "Tech",
        "fieldName": "priority"
      }
    ]
  },
  "cards": [
    {
      "id": 1,
      "name": "ST001",
      "owner": "winnie",
      "desc": "Control 报表生成",
      "priority": "Normal",
      "kanbanStages": {
        "1": {
          "stage": "提出"
        }
      }
    },
    {
      "id": 2,
      "name": "ST002",
      "owner": "sam",
      "desc": "Kanban 工具开发",
      "priority": "Normal",
      "kanbanStages": {
        "1": {
          "stage": "待开发"
        }
      }
    },
    {
      "id": 3,
      "name": "ST003",
      "owner": "ken",
      "isCompleted": true,
      "desc": "自动力测试工具集成",
      "priority": "Tech",
      "kanbanStages": {
        "1": {
          "stage": "开发"
        },
        "3": {
          "stage": "完成"
        }
      }
    }
  ]
};


var SampleBoardAndCards3 = {
  "id": 3,
  "board": {
    "id": "1",
    "stages": [
      {
        "name": "需求",
        "wip": "∞"
      },
      {
        "name": "确认",
        "wip": "6"
      },
      {
        "name": "开发",
        "wip": 8,
        "board": {
          "id": "3",
          "isChildBoard": true,
          "stages": [
            {
              "name": "进行中",
              "isDefault": true,
              "wip": 2
            },
            {
              "name": "自测",
              "wip": 2
            },
            {
              "name": "集成测试",
              "wip": 2
            },
            {
              "name": "完成",
              "wip": 2
            },
            {
              "name": "发布",
              "wip": "∞"
            }
          ]
        }
      },
      {
        "name": "交付",
        "wip": "∞"
      }
    ],
    "lanes": [
      {
        "name": "Expedite",
        "fieldName": "priority"
      },
      {
        "name": "Normal",
        "fieldName": "priority",
        "isDefault": true,
        "lane": {
          "name": "Apple",
          "isDefault": true,
          "fieldName": "customer"
        }
      },
      {
        "name": "Normal",
        "fieldName": "priority",
        "isDefault": true,
        "lane": {
          "name": "Amazon",
          "fieldName": "customer"
        }
      }
    ]
  },
  "cards": [
    {
      "id": 1,
      "name": "F001",
      "owner": "winnie",
      "isCompleted": true,
      "desc": "欧洲市场系统支持",
      "customer": "Apple",
      "priority": "Expedite",
      "kanbanStages": {
        "1": {
          "stage": "确认"
        }
      },
      "childs": [
        {
          "id": 5,
          "name": "ST004",
          "desc": "iOS 开发",
          "owner": "sam",
          "parent": 1
        }
      ]
    },
    {
      "id": 2,
      "name": "F002",
      "desc": "Firephone 研发",
      "owner": "ken",
      "customer": "Amazon",
      "priority": "Normal",
      "kanbanStages": {
        "1": {
          "stage": "开发"
        }
      },
      "childs": [
        {
          "id": 3,
          "name": "ST0001",
          "desc": "OS 系统开发",
          "owner": "ken",
          "kanbanStages": {
            "3": {
              "stage": "自测"
            }
          },
          "parent": 2
        },
        {
          "id": 4,
          "name": "ST0002",
          "blocked": true,
          "desc": "硬件生产",
          "owner": "sam",
          "kanbanStages": {
            "3": {
              "stage": "集成测试"
            }
          },
          "parent": 2
        }
      ]
    },
    {
      "id": 3,
      "name": "F003",
      "desc": "IPhone6 生产",
      "owner": "winnie",
      "isCompleted": true,
      "priority": "Normal",
      "customer": "Apple",
      "kanbanStages": {
        "1": {
          "stage": "交付"
        }
      },
      "childs": [
        {
          "id": 4,
          "name": "ST003",
          "desc": "iOS",
          "owner": "winnie",
          "isCompleted": true,
          "kanbanStages": {
            "3": {
              "stage": "发布"
            }
          },
          "parent": 3
        }
      ]
    }
  ]
};
