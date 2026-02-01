load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ng_module(
    name = "data_source",
    srcs = [
        "index.ts",
        "metrics_data_source.ts",
        "metrics_data_source_module.ts",
    ],
    deps = [
        ":backend_types",
        ":saved_pins_data_source",
        ":types",
        "//tensorbored/webapp/feature_flag",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/feature_flag/store:types",
        "//tensorbored/webapp/metrics:internal_types",
        "//tensorbored/webapp/webapp_data_source:http_client",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ng_module(
    name = "card_interactions_data_source",
    srcs = [
        "card_interactions_data_source.ts",
        "card_interactions_data_source_module.ts",
    ],
    deps = [
        "//tensorbored/webapp/metrics/store:types",
        "@npm//@angular/core",
    ],
)

tf_ng_module(
    name = "saved_pins_data_source",
    srcs = [
        "saved_pins_data_source.ts",
        "saved_pins_data_source_module.ts",
    ],
    deps = [
        ":types",
        "//tensorbored/webapp/metrics:internal_types",
        "@npm//@angular/core",
    ],
)

tf_ts_library(
    name = "types",
    srcs = [
        "types.ts",
    ],
    deps = [
        "//tensorbored/webapp/metrics:internal_types",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "backend_types",
    srcs = [
        "metrics_backend_types.ts",
    ],
    visibility = ["//visibility:private"],
    deps = [
        ":types",
    ],
)

tf_ts_library(
    name = "metrics_data_source_test",
    testonly = True,
    srcs = [
        "metrics_data_source_test.ts",
    ],
    deps = [
        ":backend_types",
        ":data_source",
        ":types",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/feature_flag:testing",
        "//tensorbored/webapp/metrics:internal_types",
        "//tensorbored/webapp/testing:utils",
        "//tensorbored/webapp/webapp_data_source:http_client_testing",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "card_interactions_data_source_test",
    testonly = True,
    srcs = [
        "card_interactions_data_source_test.ts",
    ],
    deps = [
        ":card_interactions_data_source",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/metrics:internal_types",
        "@npm//@types/jasmine",
    ],
)

tf_ts_library(
    name = "saved_pins_data_source_test",
    testonly = True,
    srcs = [
        "saved_pins_data_source_test.ts",
    ],
    deps = [
        ":saved_pins_data_source",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/metrics:internal_types",
        "@npm//@types/jasmine",
    ],
)
