load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_sass_binary")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_sass_binary(
    name = "style",
    src = "feature_flag_dialog_component.scss",
    deps = [
        "//tensorbored/webapp:angular_material_sass_deps",
        "//tensorbored/webapp/theme",
    ],
)

tf_ng_module(
    name = "feature_flag_modal_trigger",
    srcs = [
        "feature_flag_modal_trigger_container.ts",
        "feature_flag_modal_trigger_module.ts",
    ],
    deps = [
        ":feature_flag_dialog",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/angular:expect_angular_cdk_overlay",
        "//tensorbored/webapp/angular:expect_angular_material_dialog",
        "//tensorbored/webapp/feature_flag/actions",
        "//tensorbored/webapp/feature_flag/store",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ng_module(
    name = "feature_flag_dialog",
    srcs = [
        "feature_flag_dialog_component.ts",
        "feature_flag_dialog_container.ts",
        "feature_flag_dialog_module.ts",
        "types.ts",
    ],
    assets = [
        ":style",
        "feature_flag_dialog_component.ng.html",
    ],
    deps = [
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/angular:expect_angular_material_button",
        "//tensorbored/webapp/angular:expect_angular_material_select",
        "//tensorbored/webapp/feature_flag:types",
        "//tensorbored/webapp/feature_flag/actions",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/feature_flag/store:feature_flag_metadata",
        "//tensorbored/webapp/feature_flag/store:types",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ng_module(
    name = "views_test_lib",
    testonly = True,
    srcs = [
        "feature_flag_dialog_test.ts",
        "feature_flag_modal_trigger_container_test.ts",
    ],
    deps = [
        ":feature_flag_dialog",
        ":feature_flag_modal_trigger",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/angular:expect_angular_cdk_testing",
        "//tensorbored/webapp/angular:expect_angular_cdk_testing_testbed",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_angular_material_dialog",
        "//tensorbored/webapp/angular:expect_angular_material_dialog_testing",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_animations",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/feature_flag:types",
        "//tensorbored/webapp/feature_flag/actions",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/feature_flag/store:testing",
        "//tensorbored/webapp/testing:utils",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
        "@npm//rxjs",
    ],
)
