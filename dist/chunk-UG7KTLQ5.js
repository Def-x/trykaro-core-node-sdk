// src/gateways/registry.ts
var registry = {};
function registerPaymentGateway(name, component) {
  registry[name] = component;
}
function getPaymentGateway(name) {
  return registry[name] ?? null;
}

export { getPaymentGateway, registerPaymentGateway };
//# sourceMappingURL=chunk-UG7KTLQ5.js.map
//# sourceMappingURL=chunk-UG7KTLQ5.js.map