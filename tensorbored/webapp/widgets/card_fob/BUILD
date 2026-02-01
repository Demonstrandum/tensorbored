load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_sass_binary", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_sass_binary(
    name = "card_fob_styles",
    src = "card_fob_component.scss",
    deps = [
        "//tensorbored/webapp:angular_material_sass_deps",
        "//tensorbored/webapp/theme",
    ],
)

tf_sass_binary(
    name = "card_fob_controller_styles",
    src = "card_fob_controller_component.scss",
)

tf_ng_module(
    name = "card_fob",
    srcs = [
        "card_fob_component.ts",
        "card_fob_controller_component.ts",
        "card_fob_module.ts",
    ],
    assets = [
        "card_fob_controller_component.ng.html",
        "card_fob_component.ng.html",
        ":card_fob_styles",
        ":card_fob_controller_styles",
    ],
    deps = [
        ":types",
        "//tensorbored/webapp/angular:expect_angular_material_icon",
        "//tensorbored/webapp/third_party:d3",
        "@npm//@angular/common",
        "@npm//@angular/core",
    ],
)

tf_ts_library(
    name = "card_fob_test",
    testonly = True,
    srcs = [
        "card_fob_controller_test.ts",
        "card_fob_test.ts",
    ],
    deps = [
        ":card_fob",
        ":types",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/testing:dom",
        "//tensorbored/webapp/third_party:d3",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@types/jasmine",
    ],
)

tf_ts_library(
    name = "types",
    srcs = [
        "card_fob_types.ts",
    ],
)
