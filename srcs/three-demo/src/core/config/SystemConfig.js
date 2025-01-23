const SystemConfig = {
  SynchronizationSystem: {
    order: 0,
    interval: 1000 / 120,
  },
  MovementSystem: {
    order: 1,
    interval: 1000 / 120,
  },
  InputSystem: {
    order: 2,
    interval: 1000 / 120,
  },
  UISystem: {
    order: 3,
    interval: 1000 / 60,
  },
  RenderingSystem: {
    order: 10,
    interval: 1000 / 200,
  },
};

export default SystemConfig;