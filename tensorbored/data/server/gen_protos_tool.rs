/* Copyright 2020 The TensorFlow Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

use std::path::PathBuf;

fn main() -> std::io::Result<()> {
    let rule_dir = PathBuf::from(
        std::env::args_os()
            .nth(1)
            .expect("must give output dir as first arg"),
    );
    let out_dir = {
        let mut dir = rule_dir;
        dir.push("genproto");
        dir
    };
    let file_descriptor = out_dir.join("descriptor.bin");
    let mut prost_config = prost_build::Config::new();
    // Generate `bytes::Bytes` struct fields for all `bytes` protobuf fields in the `tensorbored`
    // package.
    prost_config.bytes(&[".tensorbored"]);
    tonic_build::configure()
        .out_dir(&out_dir)
        .file_descriptor_set_path(&file_descriptor)
        .format(false) // don't run `rustfmt`; shouldn't be needed to build
        .compile_with_config(
            prost_config,
            &[
                "tensorbored/compat/proto/event.proto",
                "tensorbored/data/proto/data_provider.proto",
                "tensorbored/plugins/audio/plugin_data.proto",
                "tensorbored/plugins/image/plugin_data.proto",
            ],
            &["."],
        )
        .expect("compile_protos");
    Ok(())
}
