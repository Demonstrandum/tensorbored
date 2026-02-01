load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ng_web_test_suite", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "types",
    srcs = [
        "types.ts",
    ],
    deps = [
        ":_types",
        "//tensorbored/webapp/hparams/_redux:types",
    ],
)

tf_ts_library(
    name = "_types",
    srcs = [
        "_types.ts",
    ],
    deps = [
        "//tensorbored/webapp/runs/data_source",
        "//tensorbored/webapp/runs/data_source:backend_types",
        "//tensorbored/webapp/widgets/data_table:types",
    ],
)

tf_ng_module(
    name = "hparams",
    srcs = [
        "hparams_module.ts",
        "index.ts",
    ],
    deps = [
        "//tensorbored/webapp/hparams/_redux:hparams_actions",
        "//tensorbored/webapp/hparams/_redux:hparams_module",
        "//tensorbored/webapp/hparams/_redux:hparams_selectors",
        "//tensorbored/webapp/persistent_settings:config_module",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "testing",
    testonly = True,
    srcs = [
        "testing.ts",
    ],
    deps = [
        "//tensorbored/webapp/hparams/_redux:testing",
    ],
)

tf_ng_web_test_suite(
    name = "karma_test",
    deps = [
        "//tensorbored/webapp/hparams/_redux:_redux_test_lib",
    ],
)
