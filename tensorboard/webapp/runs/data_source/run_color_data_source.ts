/* Copyright 2026 The TensorBored Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ==============================================================================*/

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {TBHttpClient} from '../../webapp_data_source/tb_http_client';

/**
 * Fetches run color overrides from the backend.
 *
 * The backend can source these from a JSON file under the logdir (see
 * `/data/run_colors`).
 */
@Injectable()
export class TBRunColorDataSource {
  constructor(private readonly http: TBHttpClient) {}

  fetchRunColors(experimentId: string): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(
      `/experiment/${experimentId}/data/run_colors`
    );
  }
}
