(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports !== "undefined") {
    factory();
  } else {
    var mod = {
      exports: {}
    };
    factory();
    global.index = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
  function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
  function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
  function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
  function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
  function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
  function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
  function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
  function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
  function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
  // Sovereign Command Center Main Entry Point
  // Covren Firm LLC - Production Grade Client Portal

  // Wait for React and ReactDOM to load
  function waitForDependencies() {
    var maxRetries = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 50;
    return new Promise(function (resolve, reject) {
      var retries = 0;
      var _checkDependencies = function checkDependencies() {
        var hasReact = typeof window.React !== 'undefined' && window.React !== null;
        var hasReactDOM = typeof window.ReactDOM !== 'undefined' && window.ReactDOM !== null && typeof window.ReactDOM.render === 'function';
        console.log('Dependency check:', {
          hasReact: hasReact,
          hasReactDOM: hasReactDOM
        });
        if (hasReact && hasReactDOM) {
          resolve();
        } else if (retries >= maxRetries) {
          reject(new Error('Max retry attempts reached for dependency loading: ' + JSON.stringify({
            hasReact: hasReact,
            hasReactDOM: hasReactDOM
          })));
        } else {
          retries++;
          console.log("Dependencies not loaded yet. Retrying... (Attempt ".concat(retries, "/").concat(maxRetries, ")"), {
            hasReact: hasReact,
            hasReactDOM: hasReactDOM
          });
          setTimeout(_checkDependencies, 300);
        }
      };
      _checkDependencies();
    });
  }

  // Initialize React app
  function initializeApp() {
    return _initializeApp.apply(this, arguments);
  } // Loading spinner component
  function _initializeApp() {
    _initializeApp = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1() {
      var createElement, render, _t1;
      return _regenerator().w(function (_context1) {
        while (1) switch (_context1.p = _context1.n) {
          case 0:
            _context1.p = 0;
            _context1.n = 1;
            return waitForDependencies();
          case 1:
            createElement = window.React.createElement;
            render = window.ReactDOM.render;
            render(createElement(App), document.getElementById('root'));
            _context1.n = 3;
            break;
          case 2:
            _context1.p = 2;
            _t1 = _context1.v;
            console.error('App initialization failed:', _t1);
            throw _t1;
          case 3:
            return _context1.a(2);
        }
      }, _callee1, null, [[0, 2]]);
    }));
    return _initializeApp.apply(this, arguments);
  }
  var LoadingSpinner = function LoadingSpinner(_ref) {
    var _ref$size = _ref.size,
      size = _ref$size === void 0 ? 'medium' : _ref$size,
      _ref$color = _ref.color,
      color = _ref$color === void 0 ? 'cyan' : _ref$color,
      _ref$className = _ref.className,
      className = _ref$className === void 0 ? '' : _ref$className;
    var sizeClasses = {
      small: 'h-4 w-4',
      medium: 'h-8 w-8',
      large: 'h-12 w-12'
    };
    var colorClasses = {
      cyan: 'border-cyan-400',
      white: 'border-white',
      gray: 'border-gray-400'
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "flex justify-center items-center ".concat(className)
    }, /*#__PURE__*/React.createElement("div", {
      className: "\n          animate-spin rounded-full border-2 border-t-transparent\n          ".concat(sizeClasses[size], "\n          ").concat(colorClasses[color], "\n        ")
    }));
  };

  // Error toast component
  var ErrorToast = function ErrorToast(_ref2) {
    var message = _ref2.message,
      onClose = _ref2.onClose,
      _ref2$type = _ref2.type,
      type = _ref2$type === void 0 ? 'error' : _ref2$type,
      _ref2$duration = _ref2.duration,
      duration = _ref2$duration === void 0 ? 5000 : _ref2$duration;
    React.useEffect(function () {
      if (duration > 0) {
        var timer = setTimeout(onClose, duration);
        return function () {
          return clearTimeout(timer);
        };
      }
    }, [duration, onClose]);
    var typeClasses = {
      error: 'bg-red-800 border-red-600 text-red-100',
      warning: 'bg-yellow-800 border-yellow-600 text-yellow-100',
      info: 'bg-blue-800 border-blue-600 text-blue-100'
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "fixed top-4 right-4 z-50 max-w-sm"
    }, /*#__PURE__*/React.createElement("div", {
      className: "\n        p-4 rounded-lg shadow-lg border-l-4\n        ".concat(typeClasses[type], "\n        animate-slide-in\n      ")
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-start justify-between"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex-1"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-sm font-medium"
    }, message)), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      className: "ml-3 text-current opacity-70 hover:opacity-100 transition-opacity"
    }, /*#__PURE__*/React.createElement("svg", {
      className: "w-4 h-4",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24"
    }, /*#__PURE__*/React.createElement("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
      d: "M6 18L18 6M6 6l12 12"
    }))))));
  };
  var Dashboard = function Dashboard(_ref3) {
    var user = _ref3.user;
    var _React$useState = React.useState([]),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      projects = _React$useState2[0],
      setProjects = _React$useState2[1];
    var _React$useState3 = React.useState(true),
      _React$useState4 = _slicedToArray(_React$useState3, 2),
      loading = _React$useState4[0],
      setLoading = _React$useState4[1];
    var _React$useState5 = React.useState(null),
      _React$useState6 = _slicedToArray(_React$useState5, 2),
      error = _React$useState6[0],
      setError = _React$useState6[1];
    var _React$useState7 = React.useState('overview'),
      _React$useState8 = _slicedToArray(_React$useState7, 2),
      selectedView = _React$useState8[0],
      setSelectedView = _React$useState8[1];
    var _React$useState9 = React.useState(false),
      _React$useState0 = _slicedToArray(_React$useState9, 2),
      showProjectCreator = _React$useState0[0],
      setShowProjectCreator = _React$useState0[1];
    React.useEffect(function () {
      loadProjects();
    }, []);
    var loadProjects = /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
        var response, projectsArray, _t;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              _context.p = 0;
              setLoading(true);
              console.log('Dashboard: Starting loadProjects...');
              if (!window.projectsApi) {
                _context.n = 2;
                break;
              }
              _context.n = 1;
              return window.projectsApi.getUserProjects();
            case 1:
              response = _context.v;
              console.log('Dashboard: API response:', response);
              console.log('Dashboard: Response success:', response.success);
              console.log('Dashboard: Response data:', response.data);
              console.log('Dashboard: Is data array?', Array.isArray(response.data));
              if (response.success && response.data) {
                console.log('Dashboard: Setting projects to:', response.data);
                projectsArray = Array.isArray(response.data) ? response.data : response.data.projects || [];
                setProjects(projectsArray);
              } else {
                console.log('Dashboard: API failed, setting error:', response.error);
                setError(response.error || 'Failed to load projects');
              }
              _context.n = 3;
              break;
            case 2:
              console.error('Dashboard: projectsApi not available on window');
              setError('API not available');
            case 3:
              _context.n = 5;
              break;
            case 4:
              _context.p = 4;
              _t = _context.v;
              console.error('Dashboard: Exception in loadProjects:', _t);
              setError('Failed to load projects');
            case 5:
              _context.p = 5;
              setLoading(false);
              return _context.f(5);
            case 6:
              return _context.a(2);
          }
        }, _callee, null, [[0, 4, 5, 6]]);
      }));
      return function loadProjects() {
        return _ref4.apply(this, arguments);
      };
    }();
    var handleProjectCreated = function handleProjectCreated(project) {
      setProjects(function (prev) {
        return [project].concat(_toConsumableArray(prev));
      });
      setShowProjectCreator(false);
    };
    var handleCancelProjectCreation = function handleCancelProjectCreation() {
      setShowProjectCreator(false);
    };
    var getGreeting = function getGreeting() {
      var hour = new Date().getHours();
      if (hour < 12) return 'Good morning';
      if (hour < 17) return 'Good afternoon';
      return 'Good evening';
    };
    var getProjectStats = function getProjectStats() {
      var total = projects.length;
      var active = projects.filter(function (p) {
        return p.status === 'active';
      }).length;
      var completed = projects.filter(function (p) {
        return p.status === 'completed';
      }).length;
      var critical = projects.filter(function (p) {
        return p.priority === 'critical';
      }).length;
      return {
        total: total,
        active: active,
        completed: completed,
        critical: critical
      };
    };
    var stats = getProjectStats();
    if (loading) {
      return React.createElement('div', {
        className: "min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center"
      }, React.createElement(LoadingSpinner, {
        size: 'lg'
      }));
    }
    return React.createElement('div', {
      className: "min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white"
    }, [React.createElement('nav', {
      key: 'nav',
      className: "bg-gray-800 border-b border-gray-700 px-6 py-4"
    }, React.createElement('div', {
      className: "flex items-center justify-between"
    }, [React.createElement('div', {
      key: 'nav-left',
      className: "flex items-center"
    }, React.createElement('div', {
      className: "flex items-center space-x-3"
    }, [React.createElement('div', {
      key: 'logo',
      className: "w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center"
    }, React.createElement('svg', {
      className: "w-5 h-5 text-white",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24"
    }, React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
      d: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
    }))), React.createElement('div', {
      key: 'title'
    }, [React.createElement('h1', {
      key: 'h1',
      className: "text-xl font-bold text-white"
    }, 'Sovereign Command Center™'), React.createElement('p', {
      key: 'p',
      className: "text-xs text-gray-400"
    }, 'Covren Firm LLC')])])), React.createElement('div', {
      key: 'nav-right',
      className: "flex items-center space-x-4"
    }, React.createElement('button', {
      onClick: function onClick() {
        return window.location.reload();
      },
      className: "text-gray-300 hover:text-white transition-colors"
    }, 'Sign Out'))])), React.createElement('div', {
      key: 'content',
      className: "p-6"
    }, [React.createElement('div', {
      key: 'welcome',
      className: "mb-8"
    }, [React.createElement('h1', {
      key: 'greeting',
      className: "text-3xl font-bold text-white mb-2"
    }, "".concat(getGreeting(), ", ").concat(user.full_name || user.email)), React.createElement('p', {
      key: 'subtitle',
      className: "text-gray-400"
    }, 'Welcome to your Sovereign Command Center™ dashboard')]), React.createElement('div', {
      key: 'stats',
      className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    }, [React.createElement('div', {
      key: 'total',
      className: "bg-gray-800 rounded-lg p-6 border border-gray-700"
    }, React.createElement('div', {
      className: "flex items-center"
    }, [React.createElement('div', {
      key: 'icon',
      className: "p-2 bg-blue-600 rounded-lg"
    }, React.createElement('svg', {
      className: "w-6 h-6 text-white",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24"
    }, React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
      d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
    }))), React.createElement('div', {
      key: 'text',
      className: "ml-4"
    }, [React.createElement('p', {
      key: 'label',
      className: "text-sm font-medium text-gray-400"
    }, 'Total Projects'), React.createElement('p', {
      key: 'value',
      className: "text-2xl font-bold text-white"
    }, stats.total.toString())])])), React.createElement('div', {
      key: 'active',
      className: "bg-gray-800 rounded-lg p-6 border border-gray-700"
    }, React.createElement('div', {
      className: "flex items-center"
    }, [React.createElement('div', {
      key: 'icon',
      className: "p-2 bg-green-600 rounded-lg"
    }, React.createElement('svg', {
      className: "w-6 h-6 text-white",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24"
    }, React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
      d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    }))), React.createElement('div', {
      key: 'text',
      className: "ml-4"
    }, [React.createElement('p', {
      key: 'label',
      className: "text-sm font-medium text-gray-400"
    }, 'Active Projects'), React.createElement('p', {
      key: 'value',
      className: "text-2xl font-bold text-white"
    }, stats.active.toString())])])), React.createElement('div', {
      key: 'docs',
      className: "bg-gray-800 rounded-lg p-6 border border-gray-700"
    }, React.createElement('div', {
      className: "flex items-center"
    }, [React.createElement('div', {
      key: 'icon',
      className: "p-2 bg-purple-600 rounded-lg"
    }, React.createElement('svg', {
      className: "w-6 h-6 text-white",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24"
    }, React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
      d: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    }))), React.createElement('div', {
      key: 'text',
      className: "ml-4"
    }, [React.createElement('p', {
      key: 'label',
      className: "text-sm font-medium text-gray-400"
    }, 'Documents'), React.createElement('p', {
      key: 'value',
      className: "text-2xl font-bold text-white"
    }, '0')])])), React.createElement('div', {
      key: 'critical',
      className: "bg-gray-800 rounded-lg p-6 border border-gray-700"
    }, React.createElement('div', {
      className: "flex items-center"
    }, [React.createElement('div', {
      key: 'icon',
      className: "p-2 bg-red-600 rounded-lg"
    }, React.createElement('svg', {
      className: "w-6 h-6 text-white",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24"
    }, React.createElement('path', {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
      d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
    }))), React.createElement('div', {
      key: 'text',
      className: "ml-4"
    }, [React.createElement('p', {
      key: 'label',
      className: "text-sm font-medium text-gray-400"
    }, 'Critical'), React.createElement('p', {
      key: 'value',
      className: "text-2xl font-bold text-white"
    }, stats.critical.toString())])]))]), React.createElement('div', {
      key: 'activity',
      className: "mt-8 bg-gray-800 rounded-lg border border-gray-700"
    }, [React.createElement('div', {
      key: 'header',
      className: "px-6 py-4 border-b border-gray-700"
    }, React.createElement('h3', {
      className: "text-lg font-medium text-white"
    }, 'Recent Activity')), React.createElement('div', {
      key: 'content',
      className: "p-6"
    }, React.createElement('div', {
      className: "text-center py-8"
    }, React.createElement('p', {
      className: "text-gray-400"
    }, projects.length === 0 ? 'No recent activity. Create your first project to get started.' : "".concat(projects.length, " projects loaded successfully."))))])])]);
  };
  window.Dashboard = Dashboard;
  var authApi = {
    signIn: function signIn(credentials) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
        var response, data, _t2;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.p = _context2.n) {
            case 0:
              _context2.p = 0;
              _context2.n = 1;
              return fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email: credentials.email,
                  password: credentials.password
                })
              });
            case 1:
              response = _context2.v;
              _context2.n = 2;
              return response.json();
            case 2:
              data = _context2.v;
              if (!(data.success && data.data)) {
                _context2.n = 3;
                break;
              }
              localStorage.setItem('auth_token', data.data.token);
              return _context2.a(2, {
                data: {
                  user: data.data.user,
                  session: {
                    user: data.data.user,
                    access_token: data.data.token
                  }
                },
                error: null,
                success: true
              });
            case 3:
              return _context2.a(2, {
                data: null,
                error: data.error || 'Authentication failed',
                success: false
              });
            case 4:
              _context2.p = 4;
              _t2 = _context2.v;
              return _context2.a(2, {
                data: null,
                error: _t2.message || 'Authentication failed',
                success: false
              });
          }
        }, _callee2, null, [[0, 4]]);
      }))();
    },
    signOut: function signOut() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
        var token, _t3;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.p = _context3.n) {
            case 0:
              _context3.p = 0;
              token = localStorage.getItem('auth_token');
              if (!token) {
                _context3.n = 1;
                break;
              }
              _context3.n = 1;
              return fetch('http://localhost:8080/api/auth/logout', {
                method: 'POST',
                headers: {
                  'Authorization': "Bearer ".concat(token),
                  'Content-Type': 'application/json'
                }
              });
            case 1:
              localStorage.removeItem('auth_token');
              return _context3.a(2, {
                data: null,
                error: null,
                success: true
              });
            case 2:
              _context3.p = 2;
              _t3 = _context3.v;
              localStorage.removeItem('auth_token');
              return _context3.a(2, {
                data: null,
                error: _t3.message || 'Sign out failed',
                success: false
              });
          }
        }, _callee3, null, [[0, 2]]);
      }))();
    },
    getSession: function getSession() {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
        var token, response, data, _t4;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.p = _context4.n) {
            case 0:
              _context4.p = 0;
              token = localStorage.getItem('auth_token');
              if (token) {
                _context4.n = 1;
                break;
              }
              return _context4.a(2, {
                data: null,
                error: 'No token found',
                success: false
              });
            case 1:
              _context4.n = 2;
              return fetch('http://localhost:8080/api/auth/me', {
                headers: {
                  'Authorization': "Bearer ".concat(token),
                  'Content-Type': 'application/json'
                }
              });
            case 2:
              response = _context4.v;
              _context4.n = 3;
              return response.json();
            case 3:
              data = _context4.v;
              if (!(data.success && data.data)) {
                _context4.n = 4;
                break;
              }
              return _context4.a(2, {
                data: {
                  user: data.data.user,
                  session: {
                    user: data.data.user,
                    access_token: token
                  }
                },
                error: null,
                success: true
              });
            case 4:
              return _context4.a(2, {
                data: null,
                error: data.error || 'Failed to get session',
                success: false
              });
            case 5:
              _context4.p = 5;
              _t4 = _context4.v;
              return _context4.a(2, {
                data: null,
                error: _t4.message || 'Failed to get session',
                success: false
              });
          }
        }, _callee4, null, [[0, 5]]);
      }))();
    }
  };
  var projectsApi = {
    getUserProjects: function getUserProjects(filters) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
        var token, query, params, _filters$status, _filters$priority, response, data, _t5;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.p = _context5.n) {
            case 0:
              _context5.p = 0;
              token = localStorage.getItem('auth_token');
              if (token) {
                _context5.n = 1;
                break;
              }
              return _context5.a(2, {
                data: [],
                error: 'No authentication token',
                success: false
              });
            case 1:
              query = '/projects';
              params = new URLSearchParams();
              if (filters) {
                if ((_filters$status = filters.status) !== null && _filters$status !== void 0 && _filters$status.length) {
                  params.append('status', filters.status.join(','));
                }
                if ((_filters$priority = filters.priority) !== null && _filters$priority !== void 0 && _filters$priority.length) {
                  params.append('priority', filters.priority.join(','));
                }
                if (filters.search) {
                  params.append('search', filters.search);
                }
              }
              if (params.toString()) {
                query += "?".concat(params.toString());
              }
              _context5.n = 2;
              return fetch("http://localhost:8080/api".concat(query), {
                headers: {
                  'Authorization': "Bearer ".concat(token),
                  'Content-Type': 'application/json'
                }
              });
            case 2:
              response = _context5.v;
              _context5.n = 3;
              return response.json();
            case 3:
              data = _context5.v;
              if (!(data.success && data.data)) {
                _context5.n = 4;
                break;
              }
              return _context5.a(2, {
                data: data.data,
                error: null,
                success: true
              });
            case 4:
              return _context5.a(2, {
                data: [],
                error: data.error || 'Failed to load projects',
                success: false
              });
            case 5:
              _context5.p = 5;
              _t5 = _context5.v;
              return _context5.a(2, {
                data: [],
                error: _t5.message || 'Failed to load projects',
                success: false
              });
          }
        }, _callee5, null, [[0, 5]]);
      }))();
    },
    createProject: function createProject(projectData) {
      return _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
        var token, response, data, _t6;
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.p = _context6.n) {
            case 0:
              _context6.p = 0;
              token = localStorage.getItem('auth_token');
              if (token) {
                _context6.n = 1;
                break;
              }
              return _context6.a(2, {
                data: null,
                error: 'No authentication token',
                success: false
              });
            case 1:
              _context6.n = 2;
              return fetch('http://localhost:8080/api/projects', {
                method: 'POST',
                headers: {
                  'Authorization': "Bearer ".concat(token),
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectData)
              });
            case 2:
              response = _context6.v;
              _context6.n = 3;
              return response.json();
            case 3:
              data = _context6.v;
              if (!(data.success && data.data)) {
                _context6.n = 4;
                break;
              }
              return _context6.a(2, {
                data: data.data,
                error: null,
                success: true
              });
            case 4:
              return _context6.a(2, {
                data: null,
                error: data.error || 'Failed to create project',
                success: false
              });
            case 5:
              _context6.p = 5;
              _t6 = _context6.v;
              return _context6.a(2, {
                data: null,
                error: _t6.message || 'Failed to create project',
                success: false
              });
          }
        }, _callee6, null, [[0, 5]]);
      }))();
    }
  };
  window.authApi = authApi;
  window.projectsApi = projectsApi;
  console.log('API services loaded:', {
    authApi: !!window.authApi,
    projectsApi: !!window.projectsApi
  });

  // Main App Component
  var App = function App() {
    var _React$useState1 = React.useState(null),
      _React$useState10 = _slicedToArray(_React$useState1, 2),
      supabase = _React$useState10[0],
      setSupabase = _React$useState10[1];
    var _React$useState11 = React.useState(null),
      _React$useState12 = _slicedToArray(_React$useState11, 2),
      session = _React$useState12[0],
      setSession = _React$useState12[1];
    var _React$useState13 = React.useState(null),
      _React$useState14 = _slicedToArray(_React$useState13, 2),
      user = _React$useState14[0],
      setUser = _React$useState14[1];
    var _React$useState15 = React.useState(true),
      _React$useState16 = _slicedToArray(_React$useState15, 2),
      loading = _React$useState16[0],
      setLoading = _React$useState16[1];
    var _React$useState17 = React.useState(null),
      _React$useState18 = _slicedToArray(_React$useState17, 2),
      error = _React$useState18[0],
      setError = _React$useState18[1];
    var _React$useState19 = React.useState(false),
      _React$useState20 = _slicedToArray(_React$useState19, 2),
      isRegistering = _React$useState20[0],
      setIsRegistering = _React$useState20[1];
    var _React$useState21 = React.useState(''),
      _React$useState22 = _slicedToArray(_React$useState21, 2),
      email = _React$useState22[0],
      setEmail = _React$useState22[1];
    var _React$useState23 = React.useState(''),
      _React$useState24 = _slicedToArray(_React$useState23, 2),
      password = _React$useState24[0],
      setPassword = _React$useState24[1];
    var _React$useState25 = React.useState(''),
      _React$useState26 = _slicedToArray(_React$useState25, 2),
      confirmPassword = _React$useState26[0],
      setConfirmPassword = _React$useState26[1];
    var _React$useState27 = React.useState(''),
      _React$useState28 = _slicedToArray(_React$useState27, 2),
      fullName = _React$useState28[0],
      setFullName = _React$useState28[1];
    var _React$useState29 = React.useState(''),
      _React$useState30 = _slicedToArray(_React$useState29, 2),
      company = _React$useState30[0],
      setCompany = _React$useState30[1];
    var _React$useState31 = React.useState(''),
      _React$useState32 = _slicedToArray(_React$useState31, 2),
      position = _React$useState32[0],
      setPosition = _React$useState32[1];
    React.useEffect(function () {
      checkSession();
    }, []);
    var checkSession = /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
        var token, response, result, _t7;
        return _regenerator().w(function (_context7) {
          while (1) switch (_context7.p = _context7.n) {
            case 0:
              _context7.p = 0;
              token = localStorage.getItem('auth_token');
              if (!token) {
                _context7.n = 4;
                break;
              }
              _context7.n = 1;
              return fetch('http://localhost:8080/api/auth/me', {
                headers: {
                  'Authorization': "Bearer ".concat(token),
                  'Content-Type': 'application/json'
                }
              });
            case 1:
              response = _context7.v;
              if (!response.ok) {
                _context7.n = 3;
                break;
              }
              _context7.n = 2;
              return response.json();
            case 2:
              result = _context7.v;
              if (result.success) {
                setUser(result.data.user);
                setSession({
                  user: result.data.user,
                  access_token: token
                });
              }
              _context7.n = 4;
              break;
            case 3:
              localStorage.removeItem('auth_token');
            case 4:
              _context7.n = 6;
              break;
            case 5:
              _context7.p = 5;
              _t7 = _context7.v;
              console.error('Session check failed:', _t7);
              localStorage.removeItem('auth_token');
            case 6:
              _context7.p = 6;
              setLoading(false);
              return _context7.f(6);
            case 7:
              return _context7.a(2);
          }
        }, _callee7, null, [[0, 5, 6, 7]]);
      }));
      return function checkSession() {
        return _ref5.apply(this, arguments);
      };
    }();
    var handleLogin = /*#__PURE__*/function () {
      var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(e) {
        var response, result, _t8;
        return _regenerator().w(function (_context8) {
          while (1) switch (_context8.p = _context8.n) {
            case 0:
              e.preventDefault();
              if (!(!email || !password)) {
                _context8.n = 1;
                break;
              }
              setError('Please fill in all fields');
              return _context8.a(2);
            case 1:
              _context8.p = 1;
              setLoading(true);
              setError(null);
              _context8.n = 2;
              return fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email: email,
                  password: password
                })
              });
            case 2:
              response = _context8.v;
              _context8.n = 3;
              return response.json();
            case 3:
              result = _context8.v;
              if (!(!response.ok || !result.success)) {
                _context8.n = 4;
                break;
              }
              throw new Error(result.error || 'Login failed');
            case 4:
              localStorage.setItem('auth_token', result.data.token);
              setSession({
                user: result.data.user,
                access_token: result.data.token
              });
              setUser(result.data.user);
              setEmail('');
              setPassword('');
              _context8.n = 6;
              break;
            case 5:
              _context8.p = 5;
              _t8 = _context8.v;
              console.error('Login error:', _t8);
              setError(_t8.message || 'Login failed');
            case 6:
              _context8.p = 6;
              setLoading(false);
              return _context8.f(6);
            case 7:
              return _context8.a(2);
          }
        }, _callee8, null, [[1, 5, 6, 7]]);
      }));
      return function handleLogin(_x) {
        return _ref6.apply(this, arguments);
      };
    }();
    var handleRegister = /*#__PURE__*/function () {
      var _ref7 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(e) {
        var response, result, _t9;
        return _regenerator().w(function (_context9) {
          while (1) switch (_context9.p = _context9.n) {
            case 0:
              e.preventDefault();
              if (!(!email || !password || !confirmPassword || !fullName)) {
                _context9.n = 1;
                break;
              }
              setError('Please fill in all required fields');
              return _context9.a(2);
            case 1:
              if (!(password !== confirmPassword)) {
                _context9.n = 2;
                break;
              }
              setError('Passwords do not match');
              return _context9.a(2);
            case 2:
              _context9.p = 2;
              setLoading(true);
              setError(null);
              _context9.n = 3;
              return fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email: email,
                  password: password,
                  full_name: fullName,
                  company: company,
                  position: position
                })
              });
            case 3:
              response = _context9.v;
              _context9.n = 4;
              return response.json();
            case 4:
              result = _context9.v;
              if (!(!response.ok || !result.success)) {
                _context9.n = 5;
                break;
              }
              throw new Error(result.error || 'Registration failed');
            case 5:
              localStorage.setItem('auth_token', result.data.token);
              setSession({
                user: result.data.user,
                access_token: result.data.token
              });
              setUser(result.data.user);
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setFullName('');
              setCompany('');
              setPosition('');
              _context9.n = 7;
              break;
            case 6:
              _context9.p = 6;
              _t9 = _context9.v;
              console.error('Registration error:', _t9);
              setError(_t9.message || 'Registration failed');
            case 7:
              _context9.p = 7;
              setLoading(false);
              return _context9.f(7);
            case 8:
              return _context9.a(2);
          }
        }, _callee9, null, [[2, 6, 7, 8]]);
      }));
      return function handleRegister(_x2) {
        return _ref7.apply(this, arguments);
      };
    }();
    var handleLogout = /*#__PURE__*/function () {
      var _ref8 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0() {
        var token, _t0;
        return _regenerator().w(function (_context0) {
          while (1) switch (_context0.p = _context0.n) {
            case 0:
              _context0.p = 0;
              token = localStorage.getItem('auth_token');
              if (!token) {
                _context0.n = 1;
                break;
              }
              _context0.n = 1;
              return fetch('http://localhost:8080/api/auth/logout', {
                method: 'POST',
                headers: {
                  'Authorization': "Bearer ".concat(token),
                  'Content-Type': 'application/json'
                }
              });
            case 1:
              localStorage.removeItem('auth_token');
              setSession(null);
              setUser(null);
              _context0.n = 3;
              break;
            case 2:
              _context0.p = 2;
              _t0 = _context0.v;
              console.error('Logout error:', _t0);
              localStorage.removeItem('auth_token');
              setSession(null);
              setUser(null);
            case 3:
              return _context0.a(2);
          }
        }, _callee0, null, [[0, 2]]);
      }));
      return function handleLogout() {
        return _ref8.apply(this, arguments);
      };
    }();
    if (loading) {
      return /*#__PURE__*/React.createElement("div", {
        className: "min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-inter flex items-center justify-center"
      }, /*#__PURE__*/React.createElement(LoadingSpinner, {
        size: "large"
      }));
    }
    if (!user) {
      return /*#__PURE__*/React.createElement("div", {
        className: "min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-inter flex items-center justify-center p-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "w-full max-w-md"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-center mb-8"
      }, /*#__PURE__*/React.createElement("h1", {
        className: "text-4xl font-bold text-cyan-400 neon-glow mb-2"
      }, "Sovereign Command Center\u2122"), /*#__PURE__*/React.createElement("p", {
        className: "text-gray-400 text-lg"
      }, "Covren Firm LLC - Client Portal")), isRegistering ? /*#__PURE__*/React.createElement("div", {
        className: "bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-center mb-6"
      }, /*#__PURE__*/React.createElement("h2", {
        className: "text-2xl font-bold text-white mb-2"
      }, "Create Command Center Account"), /*#__PURE__*/React.createElement("p", {
        className: "text-gray-400"
      }, "Join the Sovereign Command Center\u2122")), /*#__PURE__*/React.createElement("form", {
        onSubmit: handleRegister,
        className: "space-y-4"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "block text-sm font-medium text-gray-300 mb-1"
      }, "Full Name *"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: fullName,
        onChange: function onChange(e) {
          return setFullName(e.target.value);
        },
        className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent",
        placeholder: "Enter your full name",
        required: true,
        disabled: loading
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "block text-sm font-medium text-gray-300 mb-1"
      }, "Email Address *"), /*#__PURE__*/React.createElement("input", {
        type: "email",
        value: email,
        onChange: function onChange(e) {
          return setEmail(e.target.value);
        },
        className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent",
        placeholder: "Enter your email address",
        required: true,
        disabled: loading
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "block text-sm font-medium text-gray-300 mb-1"
      }, "Company"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: company,
        onChange: function onChange(e) {
          return setCompany(e.target.value);
        },
        className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent",
        placeholder: "Enter your company name",
        disabled: loading
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "block text-sm font-medium text-gray-300 mb-1"
      }, "Position"), /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: position,
        onChange: function onChange(e) {
          return setPosition(e.target.value);
        },
        className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent",
        placeholder: "Enter your position",
        disabled: loading
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "block text-sm font-medium text-gray-300 mb-1"
      }, "Password *"), /*#__PURE__*/React.createElement("input", {
        type: "password",
        value: password,
        onChange: function onChange(e) {
          return setPassword(e.target.value);
        },
        className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent",
        placeholder: "Create a strong password",
        required: true,
        disabled: loading
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "block text-sm font-medium text-gray-300 mb-1"
      }, "Confirm Password *"), /*#__PURE__*/React.createElement("input", {
        type: "password",
        value: confirmPassword,
        onChange: function onChange(e) {
          return setConfirmPassword(e.target.value);
        },
        className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent",
        placeholder: "Confirm your password",
        required: true,
        disabled: loading
      })), /*#__PURE__*/React.createElement("button", {
        type: "submit",
        disabled: loading,
        className: "w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      }, loading ? /*#__PURE__*/React.createElement("div", {
        className: "flex items-center justify-center"
      }, /*#__PURE__*/React.createElement(LoadingSpinner, {
        size: "small",
        color: "white"
      }), /*#__PURE__*/React.createElement("span", {
        className: "ml-2"
      }, "Creating Account...")) : 'Create Command Center Account')), /*#__PURE__*/React.createElement("div", {
        className: "mt-6 text-center"
      }, /*#__PURE__*/React.createElement("p", {
        className: "text-gray-400"
      }, "Already have an account?", ' ', /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: function onClick() {
          return setIsRegistering(false);
        },
        className: "text-cyan-400 hover:text-cyan-300 font-medium transition-colors",
        disabled: loading
      }, "Sign In")))) : /*#__PURE__*/React.createElement("div", {
        className: "bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-center mb-6"
      }, /*#__PURE__*/React.createElement("h2", {
        className: "text-2xl font-bold text-white mb-2"
      }, "Access Command Center"), /*#__PURE__*/React.createElement("p", {
        className: "text-gray-400"
      }, "Enter your credentials to proceed")), /*#__PURE__*/React.createElement("form", {
        onSubmit: handleLogin,
        className: "space-y-4"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "block text-sm font-medium text-gray-300 mb-1"
      }, "Email Address"), /*#__PURE__*/React.createElement("input", {
        type: "email",
        value: email,
        onChange: function onChange(e) {
          return setEmail(e.target.value);
        },
        className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent",
        placeholder: "Enter your email",
        required: true,
        disabled: loading
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
        className: "block text-sm font-medium text-gray-300 mb-1"
      }, "Password"), /*#__PURE__*/React.createElement("input", {
        type: "password",
        value: password,
        onChange: function onChange(e) {
          return setPassword(e.target.value);
        },
        className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent",
        placeholder: "Enter your password",
        required: true,
        disabled: loading
      })), /*#__PURE__*/React.createElement("button", {
        type: "submit",
        disabled: loading,
        className: "w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      }, loading ? /*#__PURE__*/React.createElement("div", {
        className: "flex items-center justify-center"
      }, /*#__PURE__*/React.createElement(LoadingSpinner, {
        size: "small",
        color: "white"
      }), /*#__PURE__*/React.createElement("span", {
        className: "ml-2"
      }, "Authenticating...")) : 'Access Command Center')), /*#__PURE__*/React.createElement("div", {
        className: "mt-6 text-center"
      }, /*#__PURE__*/React.createElement("p", {
        className: "text-gray-400"
      }, "Don't have an account?", ' ', /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: function onClick() {
          return setIsRegistering(true);
        },
        className: "text-cyan-400 hover:text-cyan-300 font-medium transition-colors",
        disabled: loading
      }, "Create Account")))), error && /*#__PURE__*/React.createElement(ErrorToast, {
        message: error,
        onClose: function onClose() {
          return setError(null);
        }
      })));
    }

    // Main application dashboard - use the Dashboard component
    if (window.Dashboard) {
      return window.React.createElement(window.Dashboard, {
        user: user
      });
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-center h-screen"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-center"
    }, /*#__PURE__*/React.createElement(LoadingSpinner, {
      size: "lg"
    }), /*#__PURE__*/React.createElement("p", {
      className: "mt-4 text-gray-400"
    }, "Loading Dashboard..."))), error && /*#__PURE__*/React.createElement(ErrorToast, {
      message: error,
      onClose: function onClose() {
        return setError(null);
      }
    }));
  };

  // Render the app once dependencies are loaded
  initializeApp().then(function () {
    var createElement = window.React.createElement;
    var render = window.ReactDOM.render;
    render(createElement(App), document.getElementById('root'));
  })["catch"](function (error) {
    console.error('Failed to initialize app:', error);
    document.getElementById('root').innerHTML = "\n    <div class=\"min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-inter flex items-center justify-center p-4\">\n      <div class=\"text-center\">\n        <h1 class=\"text-2xl font-bold text-red-400 mb-4\">Initialization Failed</h1>\n        <p class=\"text-gray-400\">Failed to load the application. Please refresh the page and try again.</p>\n        <button onclick=\"window.location.reload()\" class=\"mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md\">\n          Refresh Page\n        </button>\n      </div>\n    </div>\n  ";
  });
});
