// src/gateways/registry.ts
var registry = {};
function registerPaymentGateway(name, component) {
  registry[name] = component;
}
function getPaymentGateway(name) {
  return registry[name] ?? null;
}

export { getPaymentGateway, registerPaymentGateway };
//# sourceMappingURL=chunk-LVG5TPNI.js.map
//# sourceMappingURL=chunk-LVG5TPNI.js.map