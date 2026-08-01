/**
 * Method plugins for the prototype.
 * Add a new integration by exporting an entry here — keep mapping logic in its own file.
 *
 * Each method:
 *  - id, label
 *  - load(parentIds) → { children, summary }
 *  - describeOptions(children) → HTML string or option descriptors
 *  - buildSession(children, options) → IsoplotR session object
 */

import { fetchUPbSpots, parseTokens, resolveUPbDataPointRefs } from '../api.js'
import {
  buildUPbIsoplotRSession,
  getDefaultUPbFormat,
  listUPbFormatOptions,
} from '../lib/mapUPbSpots.ts'

/** @typedef {'auto' | 'commPb' | 'total' | 'corr208'} UPbRatioSource */

export const methods = {
  upb: {
    id: 'upb',
    label: 'U-Pb',
    parentHint: 'UPbDataPoint ids and/or datapoint names (comma or newline separated)',
    /**
     * @param {string} rawInput pasted ids and/or names
     */
    async load(rawInput) {
      const { ids, notes } = await resolveUPbDataPointRefs(parseTokens(rawInput))
      const children = await fetchUPbSpots(ids)
      return {
        children,
        parentIds: ids,
        summary: `${children.length} spot(s) from ${ids.length} datapoint(s). ${notes.join(' · ')}`,
      }
    },
    defaultOptions(children) {
      const ratioSource = /** @type {UPbRatioSource} */ ('auto')
      return {
        ratioSource,
        format: getDefaultUPbFormat(children, ratioSource),
        plotdevice: undefined,
      }
    },
    listFormats(children, ratioSource) {
      return listUPbFormatOptions(children, ratioSource)
    },
    buildSession(children, options) {
      return buildUPbIsoplotRSession(children, {
        format: options.format,
        ratioSource: options.ratioSource,
        plotdevice: options.plotdevice,
      })
    },
  },

  // Stubs — implement when prototyping these methods.
  arar: {
    id: 'arar',
    label: 'Ar-Ar (stub)',
    parentHint: 'ArArDataPoint ids',
    stub: true,
    async load() {
      throw new Error('Ar-Ar not wired in this prototype yet. Extend src/methods/.')
    },
  },
  ft: {
    id: 'ft',
    label: 'Fission track (stub)',
    parentHint: 'FTDataPoint ids',
    stub: true,
    async load() {
      throw new Error('FT not wired yet. See AGENT.md § FT + Malcolm notes in hannelore.')
    },
  },
}

export function getMethod(id) {
  return methods[id] || methods.upb
}
