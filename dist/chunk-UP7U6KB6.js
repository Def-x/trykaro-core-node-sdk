// src/gateways/registry.js
var registry = {};
function registerPaymentGateway(name, component) {
  registry[name] = component;
}
function getPaymentGateway(name) {
  return registry[name] ?? null;
}

export { getPaymentGateway, registerPaymentGateway };
//# sourceMappingURL=chunk-UP7U6KB6.js.map
//# sourceMappingURL=chunk-UP7U6KB6.js.map