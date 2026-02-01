load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_sass_binary", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_sass_binary(
    name = "alert_display_snackbar_styles",
    src = "alert_display_snackbar_container.scss",
)

tf_ng_module(
    name = "alert_snackbar",
    srcs = [
        "alert_display_snackbar_container.ts",
        "alert_snackbar_container.ts",
        "alert_snackbar_module.ts",
    ],
    assets = [
        ":alert_display_snackbar_styles",
        "alert_display_snackbar_container.ng.html",
    ],
    deps = [
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/alert:types",
        "//tensorbored/webapp/alert/store",
        "//tensorbored/webapp/alert/store:types",
        "//tensorbored/webapp/angular:expect_angular_material_button",
        "//tensorbored/webapp/angular:expect_angular_material_snackbar",
        "//tensorbored/webapp/util:string",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "views_test",
    testonly = True,
    srcs = [
        "alert_snackbar_test.ts",
    ],
    deps = [
        ":alert_snackbar",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/alert/store",
        "//tensorbored/webapp/alert/store:testing",
        "//tensorbored/webapp/angular:expect_angular_cdk_overlay",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_angular_material_button",
        "//tensorbored/webapp/angular:expect_angular_material_snackbar",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_animations",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
        "@npm//rxjs",
    ],
)
