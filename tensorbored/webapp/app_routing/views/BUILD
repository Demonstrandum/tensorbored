load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ng_module(
    name = "views",
    srcs = [
        "app_routing_view_module.ts",
        "router_link_directive_container.ts",
        "router_outlet_component.ts",
        "router_outlet_container.ts",
    ],
    deps = [
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/app_routing:app_root",
        "//tensorbored/webapp/app_routing:internal_utils",
        "//tensorbored/webapp/app_routing:location",
        "//tensorbored/webapp/app_routing:route_registry",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/app_routing/actions",
        "//tensorbored/webapp/app_routing/store",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "views_tests",
    testonly = True,
    srcs = [
        "router_link_test.ts",
        "router_outlet_test.ts",
    ],
    deps = [
        ":views",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_animations",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_dynamic_testing",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/app_routing:app_root",
        "//tensorbored/webapp/app_routing:location",
        "//tensorbored/webapp/app_routing:route_registry",
        "//tensorbored/webapp/app_routing:testing",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/app_routing/actions",
        "//tensorbored/webapp/app_routing/store",
        "//tensorbored/webapp/testing:utils",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)
