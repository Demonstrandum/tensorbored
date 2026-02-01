load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_ng_module(
    name = "_views",
    srcs = [
        "polymer_interop_container.ts",
        "settings_button_component.ts",
        "settings_button_container.ts",
        "settings_dialog_component.ts",
        "settings_dialog_container.ts",
        "settings_module.ts",
    ],
    assets = [
        "settings_dialog_component.css",
        "settings_dialog_component.ng.html",
    ],
    deps = [
        "//tensorbored/webapp:tb_polymer_interop_types",
        "//tensorbored/webapp/angular:expect_angular_material_button",
        "//tensorbored/webapp/angular:expect_angular_material_checkbox",
        "//tensorbored/webapp/angular:expect_angular_material_dialog",
        "//tensorbored/webapp/angular:expect_angular_material_icon",
        "//tensorbored/webapp/angular:expect_angular_material_input",
        "//tensorbored/webapp/settings/_redux",
        "//tensorbored/webapp/types",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/forms",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "test_lib",
    testonly = True,
    srcs = [
        "polymer_interop_test.ts",
        "settings_test.ts",
    ],
    deps = [
        ":_views",
        "//tensorbored/webapp/angular:expect_angular_cdk_overlay",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_angular_material_button",
        "//tensorbored/webapp/angular:expect_angular_material_checkbox",
        "//tensorbored/webapp/angular:expect_angular_material_dialog",
        "//tensorbored/webapp/angular:expect_angular_material_icon",
        "//tensorbored/webapp/angular:expect_angular_material_input",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_animations",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_dynamic_testing",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/settings:testing",
        "//tensorbored/webapp/settings/_redux",
        "//tensorbored/webapp/testing:mat_icon",
        "//tensorbored/webapp/testing:utils",
        "//tensorbored/webapp/types",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/forms",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)
