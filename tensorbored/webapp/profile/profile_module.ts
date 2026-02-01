/* Copyright 2026 The TensorFlow Authors. All Rights Reserved.

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
import {NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {ProfileDataSourceModule} from './data_source/profile_data_source_module';
import {ProfileEffects} from './effects/profile_effects';
import {reducer} from './store/profile_reducers';
import {PROFILE_FEATURE_KEY} from './store/profile_types';

@NgModule({
  imports: [
    ProfileDataSourceModule,
    StoreModule.forFeature(PROFILE_FEATURE_KEY, reducer),
    EffectsModule.forFeature([ProfileEffects]),
  ],
})
export class ProfileModule {}
