load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_sass_binary", "tf_ts_library")

package(default_visibility = ["//tensorbored/webapp/notification_center:__subpackages__"])

licenses(["notice"])

tf_sass_binary(
    name = "notification_center_styles",
    src = "notification_center_component.scss",
    deps = [
        "//tensorbored/webapp:angular_material_sass_deps",
        "//tensorbored/webapp/theme",
    ],
)

tf_ng_module(
    name = "_views",
    srcs = [
        "notification_center_component.ts",
        "notification_center_container.ts",
        "view_types.ts",
        "views_module.ts",
    ],
    assets = [
        ":notification_center_styles",
        "notification_center_component.ng.html",
    ],
    deps = [
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/angular:expect_angular_material_button",
        "//tensorbored/webapp/angular:expect_angular_material_icon",
        "//tensorbored/webapp/angular:expect_angular_material_menu",
        "//tensorbored/webapp/notification_center/_redux",
        "//tensorbored/webapp/notification_center/_redux:actions",
        "//tensorbored/webapp/notification_center/_redux:types",
        "//tensorbored/webapp/widgets/markdown_renderer",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "_views_test",
    testonly = True,
    srcs = [
        "notification_center_test.ts",
    ],
    visibility = ["//tensorbored:internal"],
    deps = [
        ":_views",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_angular_material_button",
        "//tensorbored/webapp/angular:expect_angular_material_menu",
        "//tensorbored/webapp/angular:expect_angular_material_snackbar",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_animations",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/notification_center/_redux",
        "//tensorbored/webapp/notification_center/_redux:actions",
        "//tensorbored/webapp/notification_center/_redux:types",
        "//tensorbored/webapp/testing:mat_icon",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
        "@npm//rxjs",
    ],
)
