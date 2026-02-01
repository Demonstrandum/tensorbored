load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_ng_module(
    name = "store",
    srcs = [
        "debugger_reducers.ts",
        "debugger_selectors.ts",
        "debugger_store_utils.ts",
        "index.ts",
    ],
    deps = [
        ":debugger_store_helpers",
        ":types",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/actions",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/data_source",
        "@npm//@ngrx/store",
    ],
)

tf_ng_module(
    name = "debugger_store_helpers",
    srcs = [
        "debugger_store_helpers.ts",
    ],
    visibility = [
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store:__subpackages__",
    ],
    deps = [
        ":types",
    ],
)

tf_ng_module(
    name = "types",
    srcs = [
        "debugger_types.ts",
    ],
    deps = [
        "//tensorbored/webapp/types",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ng_module(
    name = "debug_tensor_value",
    srcs = [
        "debug_tensor_value.ts",
    ],
    deps = [
        ":types",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin:tf_types",
    ],
)

tf_ts_library(
    name = "debugger_store_test_lib",
    testonly = True,
    srcs = [
        "debug_tensor_value_test.ts",
        "debugger_graphs_reducers_test.ts",
        "debugger_reducers_test.ts",
        "debugger_selectors_test.ts",
        "debugger_store_utils_test.ts",
    ],
    deps = [
        ":debug_tensor_value",
        ":debugger_store_helpers",
        ":store",
        ":types",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/actions",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/data_source",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/testing",
        "//tensorbored/webapp/testing:lang",
        "@npm//@types/jasmine",
    ],
)
