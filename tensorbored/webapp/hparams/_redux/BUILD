load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "utils",
    srcs = [
        "utils.ts",
    ],
    deps = [
        ":types",
        "//tensorbored/webapp/hparams:types",
    ],
)

tf_ts_library(
    name = "types",
    srcs = [
        "types.ts",
    ],
    deps = [
        "//tensorbored/webapp/hparams:_types",
    ],
)

tf_ng_module(
    name = "hparams_module",
    srcs = [
        "hparams_module.ts",
    ],
    deps = [
        ":hparams_data_source",
        ":hparams_effects",
        ":hparams_reducers",
        ":types",
        "//tensorbored/webapp/hparams:types",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "hparams_actions",
    srcs = [
        "hparams_actions.ts",
    ],
    deps = [
        ":types",
        "//tensorbored/webapp/hparams:types",
        "//tensorbored/webapp/widgets/data_table:types",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "hparams_reducers",
    srcs = [
        "hparams_reducers.ts",
    ],
    deps = [
        ":hparams_actions",
        ":types",
        ":utils",
        "//tensorbored/webapp/hparams:_types",
        "//tensorbored/webapp/persistent_settings",
        "//tensorbored/webapp/runs/actions",
        "//tensorbored/webapp/widgets/data_table:types",
        "//tensorbored/webapp/widgets/data_table:utils",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "hparams_selectors",
    srcs = [
        "hparams_selectors.ts",
    ],
    deps = [
        ":hparams_actions",
        ":types",
        ":utils",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/hparams:types",
        "//tensorbored/webapp/runs/actions",
        "@npm//@ngrx/store",
    ],
)

tf_ng_module(
    name = "hparams_data_source",
    srcs = [
        "hparams_data_source.ts",
    ],
    deps = [
        "//tensorbored/webapp/hparams:types",
        "//tensorbored/webapp/webapp_data_source:http_client",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ng_module(
    name = "hparams_effects",
    srcs = [
        "hparams_effects.ts",
    ],
    deps = [
        ":hparams_actions",
        ":hparams_data_source",
        ":hparams_selectors",
        ":types",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/app_routing/actions",
        "//tensorbored/webapp/app_routing/store",
        "//tensorbored/webapp/core/actions",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/hparams:types",
        "//tensorbored/webapp/runs/actions",
        "//tensorbored/webapp/webapp_data_source:http_client",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "testing",
    testonly = True,
    srcs = [
        "testing.ts",
    ],
    deps = [
        ":types",
        ":utils",
        "//tensorbored/webapp/hparams:_types",
        "//tensorbored/webapp/util:types",
    ],
)

tf_ts_library(
    name = "_redux_test_lib",
    testonly = True,
    srcs = [
        "hparams_data_source_test.ts",
        "hparams_effects_test.ts",
        "hparams_reducers_test.ts",
        "hparams_selectors_test.ts",
        "utils_test.ts",
    ],
    deps = [
        ":hparams_actions",
        ":hparams_data_source",
        ":hparams_effects",
        ":hparams_reducers",
        ":hparams_selectors",
        ":testing",
        ":types",
        ":utils",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/app_routing/actions",
        "//tensorbored/webapp/core/actions",
        "//tensorbored/webapp/hparams:types",
        "//tensorbored/webapp/persistent_settings",
        "//tensorbored/webapp/runs/actions",
        "//tensorbored/webapp/runs/data_source:testing",
        "//tensorbored/webapp/runs/store:testing",
        "//tensorbored/webapp/testing:utils",
        "//tensorbored/webapp/util:types",
        "//tensorbored/webapp/webapp_data_source:http_client_testing",
        "//tensorbored/webapp/widgets/data_table:types",
        "//tensorbored/webapp/widgets/data_table:utils",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
        "@npm//rxjs",
    ],
)
