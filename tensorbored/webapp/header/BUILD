load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_sass_binary", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_sass_binary(
    name = "plugin_selector_styles",
    src = "plugin_selector_component.scss",
    deps = ["//tensorbored/webapp/theme"],
)

tf_sass_binary(
    name = "header_styles",
    src = "header_component.scss",
    deps = ["//tensorbored/webapp/theme"],
)

tf_ng_module(
    name = "header",
    srcs = [
        "dark_mode_toggle_component.ts",
        "dark_mode_toggle_container.ts",
        "header_component.ts",
        "header_module.ts",
        "plugin_selector_component.ts",
        "plugin_selector_container.ts",
        "reload_container.ts",
        "types.ts",
    ],
    assets = [
        ":plugin_selector_styles",
        ":header_styles",
        "plugin_selector_component.ng.html",
    ],
    deps = [
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/angular:expect_angular_material_button",
        "//tensorbored/webapp/angular:expect_angular_material_icon",
        "//tensorbored/webapp/angular:expect_angular_material_menu",
        "//tensorbored/webapp/angular:expect_angular_material_select",
        "//tensorbored/webapp/angular:expect_angular_material_tabs",
        "//tensorbored/webapp/angular:expect_angular_material_toolbar",
        "//tensorbored/webapp/core",
        "//tensorbored/webapp/core/actions",
        "//tensorbored/webapp/core/store",
        "//tensorbored/webapp/feature_flag/actions",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/feature_flag/store:types",
        "//tensorbored/webapp/profile/views",
        "//tensorbored/webapp/settings",
        "//tensorbored/webapp/types",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "test_lib",
    testonly = True,
    srcs = [
        "dark_mode_toggle_test.ts",
        "header_test.ts",
    ],
    deps = [
        ":header",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/angular:expect_angular_cdk_overlay",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_angular_material_button",
        "//tensorbored/webapp/angular:expect_angular_material_menu",
        "//tensorbored/webapp/angular:expect_angular_material_select",
        "//tensorbored/webapp/angular:expect_angular_material_tabs",
        "//tensorbored/webapp/angular:expect_angular_material_toolbar",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_animations",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/core/actions",
        "//tensorbored/webapp/core/store",
        "//tensorbored/webapp/core/testing",
        "//tensorbored/webapp/feature_flag/actions",
        "//tensorbored/webapp/settings",
        "//tensorbored/webapp/testing:mat_icon",
        "//tensorbored/webapp/testing:utils",
        "//tensorbored/webapp/types",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)
