load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")
load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

sass_binary(
    name = "dropdown_styles",
    src = "dropdown_component.scss",
    include_paths = ["external/npm/node_modules"],
    deps = [
        "//tensorbored/webapp/angular_components:material_sass",
        "//tensorbored/webapp/theme",
    ],
)

tf_ng_module(
    name = "dropdown",
    srcs = [
        "dropdown_component.ts",
        "dropdown_module.ts",
    ],
    assets = [
        ":dropdown_styles",
    ],
    deps = [
        "//tensorbored/webapp/angular:expect_angular_material_select",
        "@npm//@angular/common",
        "@npm//@angular/core",
    ],
)

tf_ts_library(
    name = "dropdown_tests",
    testonly = True,
    srcs = ["dropdown_test.ts"],
    deps = [
        ":dropdown",
        "//tensorbored/webapp/angular:expect_angular_cdk_testing_testbed",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_angular_material_select",
        "//tensorbored/webapp/angular:expect_angular_material_select_testing",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_animations",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@types/jasmine",
    ],
)
