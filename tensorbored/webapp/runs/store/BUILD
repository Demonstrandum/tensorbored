load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "store",
    srcs = [
        "index.ts",
        "runs_reducers.ts",
    ],
    deps = [
        ":types",
        ":utils",
        "//tensorbored/webapp/app_routing",
        "//tensorbored/webapp/app_routing:namespaced_state_reducer_helper",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/app_routing/actions",
        "//tensorbored/webapp/runs:types",
        "//tensorbored/webapp/runs/actions",
        "//tensorbored/webapp/types",
        "//tensorbored/webapp/types:ui",
        "//tensorbored/webapp/util:colors",
        "//tensorbored/webapp/util:ngrx",
        "//tensorbored/webapp/util:oklch_colors",
        "//tensorbored/webapp/widgets/data_table:types",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "utils",
    srcs = ["utils.ts"],
    visibility = [
        "//tensorbored/webapp/runs:__subpackages__",
    ],
    deps = [
        ":types",
        "//tensorbored/webapp/runs:types",
    ],
)

tf_ts_library(
    name = "selectors",
    srcs = ["runs_selectors.ts"],
    deps = [
        ":types",
        ":utils",
        "//tensorbored/webapp/app_routing/store",
        "//tensorbored/webapp/hparams:types",
        "//tensorbored/webapp/hparams/_redux:hparams_selectors",
        "//tensorbored/webapp/runs:types",
        "//tensorbored/webapp/types",
        "//tensorbored/webapp/types:ui",
        "//tensorbored/webapp/widgets/data_table:types",
        "//tensorbored/webapp/widgets/data_table:utils",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "types",
    srcs = [
        "runs_types.ts",
    ],
    deps = [
        "//tensorbored/webapp/app_routing:namespaced_state_reducer_helper",
        "//tensorbored/webapp/experiments:types",
        "//tensorbored/webapp/runs:types",
        "//tensorbored/webapp/runs/data_source",
        "//tensorbored/webapp/types",
        "//tensorbored/webapp/types:ui",
        "//tensorbored/webapp/widgets/data_table:types",
    ],
)

tf_ts_library(
    name = "testing",
    testonly = True,
    srcs = ["testing.ts"],
    deps = [
        ":types",
        "//tensorbored/webapp/runs:types",
        "//tensorbored/webapp/runs/data_source",
        "//tensorbored/webapp/types:ui",
        "//tensorbored/webapp/widgets/data_table:types",
    ],
)

tf_ts_library(
    name = "store_test",
    testonly = True,
    srcs = [
        "runs_reducers_test.ts",
        "runs_selectors_test.ts",
        "utils_test.ts",
    ],
    deps = [
        ":selectors",
        ":store",
        ":testing",
        ":types",
        ":utils",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/app_routing:testing",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/app_routing/actions",
        "//tensorbored/webapp/app_routing/store:testing",
        "//tensorbored/webapp/hparams:testing",
        "//tensorbored/webapp/runs:types",
        "//tensorbored/webapp/runs/actions",
        "//tensorbored/webapp/runs/data_source",
        "//tensorbored/webapp/runs/data_source:testing",
        "//tensorbored/webapp/testing:lang",
        "//tensorbored/webapp/testing:utils",
        "//tensorbored/webapp/types",
        "//tensorbored/webapp/types:ui",
        "//tensorbored/webapp/widgets/data_table:types",
        "@npm//@types/jasmine",
    ],
)
