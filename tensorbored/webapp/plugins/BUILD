load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_sass_binary", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_sass_binary(
    name = "plugins_component_styles",
    src = "plugins_component.scss",
    deps = ["//tensorbored/webapp/theme"],
)

tf_ng_module(
    name = "plugins",
    srcs = [
        "plugins_component.ts",
        "plugins_container.ts",
        "plugins_module.ts",
    ],
    assets = [
        ":plugins_component_styles",
        "plugins_component.ng.html",
    ],
    deps = [
        ":plugin_registry",
        "//tensorbored/components/experimental/plugin_util:plugin_host",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/core",
        "//tensorbored/webapp/core:types",
        "//tensorbored/webapp/core/store",
        "//tensorbored/webapp/feature_flag:types",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/settings",
        "//tensorbored/webapp/types",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ng_module(
    name = "plugin_registry",
    srcs = [
        "plugin_registry_module.ts",
        "plugin_registry_types.ts",
    ],
    deps = [
        "@npm//@angular/common",
        "@npm//@angular/core",
    ],
)

tf_ts_library(
    name = "plugins_container_test_lib",
    testonly = True,
    srcs = [
        "plugins_container_test.ts",
    ],
    deps = [
        ":plugin_registry",
        ":plugins",
        "//tensorbored/components/experimental/plugin_util:testing",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/testing",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/core",
        "//tensorbored/webapp/core:types",
        "//tensorbored/webapp/core/store",
        "//tensorbored/webapp/core/testing",
        "//tensorbored/webapp/feature_flag:testing",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/plugins/testing",
        "//tensorbored/webapp/settings",
        "//tensorbored/webapp/testing:utils",
        "//tensorbored/webapp/types",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)
