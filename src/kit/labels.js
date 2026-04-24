// All user-visible Chinese strings live here. Animations MUST NOT hard-code
// Chinese inline — add the string here and import it. Seeded from
// PROJECT_PLAN.md section 10; expand per chapter as animations land.

export const labels = {
  common: {
    altitude:   '高度',
    velocity:   '速度',
    thrust:     '推力',
    attitude:   '姿态',
    position:   '位置',
    error:      '误差',
    mode:       '模式',
    frequency:  '频率',
    on:         '开启',
    off:        '关闭',
  },
  layers: {
    hardware:     '硬件层',
    control:      '控制层',
    localization: '定位层',
    planning:     '规划层',
    perception:   '感知层',
    coordination: '协同层',
  },
  ch01: {
    stackTitle:    '自主飞行技术栈',
    pyramidTitle:  '频率金字塔',
    couplingTitle: '模块耦合',
    stack: {
      layersPanel:  '层级 · 频率',
      flowPanel:    '数据流',
      activeLayer:  '当前层',
      uplink:       '上行 · 传感数据',
      downlink:     '下行 · 控制指令',
      // Representative operating-frequency bands, intentionally rounded.
      // Real ratios span ~3 orders of magnitude; see P0-2 for log discussion.
      freqHardware:     '1 – 10 kHz',
      freqControl:      '500 – 1000 Hz',
      freqLocalization: '100 – 400 Hz',
      freqPlanning:     '10 – 100 Hz',
      freqPerception:   '10 – 60 Hz',
      freqCoordination: '1 – 10 Hz',
    },
    pyramid: {
      panelTitle: '频率金字塔',
      ringControl:    '控制环 · 内',
      ringPlanning:   '规划环 · 中',
      ringPerception: '感知环 · 外',
      // Footer note: visual rotation speeds are proportional to the true
      // frequency ratio (control ≈ 33× perception). Without a note the
      // viewer might assume the pyramid's visual blur is artistic.
      note: '转速反映真实频率比 · 控制环约 33× 感知环',
    },
    coupling: {
      panelTitle:    '模块耦合',
      nodesTitle:    '节点',
      detailTitle:   '节点详情',
      hintIdle:      '点击节点 · 查看输入与输出',
      selected:      '已选中',
      inputs:        '输入',
      outputs:       '输出',
      none:          '—',
      // Node role names — kept distinct from labels.layers.* which carry
      // the '层' suffix used by the autonomy-stack scene.
      perception:    '感知',
      localization:  '定位',
      planning:      '规划',
      control:       '控制',
    },
  },
  ch02: {
    explodedTitle:     '四旋翼组件',
    imuVibrationTitle: 'IMU 振动耦合',
    frame:     '机架',
    motor:     '电机',
    esc:       '电调',
    battery:   '电池',
    fc:        '飞控',
    imu:       'IMU',
    camera:    '相机',
    gnss:      'GNSS 天线',
    companion: '机载计算机',
    exploded: {
      // Parts carry a zh-CN name shown in the DOM callout and an EN gloss
      // shown in monospace under it. Matches the project's "Chinese + English
      // on first appearance" language policy.
      partsTitle:    '组件 · 9 件',
      stateTitle:    '状态',
      stateAssembled: '组装',
      stateExplode:   '展开中',
      stateHold:      '展开保持',
      stateReform:    '复位中',
      hint:           '自动循环 · 点击画面暂停',
      hintResume:     '已暂停 · 点击画面继续',
      partCount:      '组件数',
      frameEn:     'Frame',
      motorEn:     'Motor ×4',
      escEn:       'ESC ×4',
      batteryEn:   'Battery',
      fcEn:        'Flight Controller',
      imuEn:       'IMU',
      cameraEn:    'Stereo Camera',
      gnssEn:      'GNSS Antenna',
      companionEn: 'Companion Computer',
    },
  },
  demo: {
    // Strings used only by src/kit-demo.html (Phase 0 acceptance test).
    title:     '工具包演示',
    telemetry: '遥测',
    sensors:   '传感器',
    lidarHits: '激光命中',
    trail:     '飞行轨迹',
    altChart:  '高度曲线',
  },
};
