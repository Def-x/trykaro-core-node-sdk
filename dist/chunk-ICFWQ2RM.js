// src/gateways/registry.js
var registry = {};
function registerPaymentGateway(name, component) {
  registry[name] = component;
}
function getPaymentGateway(name) {
  return registry[name] ?? null;
}

export { getPaymentGateway, registerPaymentGateway };
//# sourceMappingURL=chunk-ICFWQ2RM.js.map
//# sourceMappingURL=chunk-ICFWQ2RM.js.map