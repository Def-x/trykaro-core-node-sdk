// src/gateways/registry.js
var registry = {};
function registerPaymentGateway(name, component) {
  registry[name] = component;
}
function getPaymentGateway(name) {
  return registry[name] ?? null;
}

export { getPaymentGateway, registerPaymentGateway };
//# sourceMappingURL=chunk-ZXSZ7SQJ.js.map
//# sourceMappingURL=chunk-ZXSZ7SQJ.js.map