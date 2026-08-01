import sessionTemplate from '../../fixtures/sessionTemplate.json'

/** Full IsoplotRgui session blob. */
export type IsoplotRSession = Record<string, unknown>

/** Subset of UPbSpotData fields used for IsoplotR export. */
export type UPbSpotRow = {
  id?: number
  aliquotName?: string | null
  spotID?: string | null
  uPbDataPointId?: number | null
  i207Pb235UTotal?: number | null
  i207Pb235UTotalUncertainty?: number | null
  i206Pb238UTotal?: number | null
  i206Pb238UTotalUncertainty?: number | null
  i238U206PbTotal?: number | null
  i238U206PbTotalUncertainty?: number | null
  i207Pb206PbTotal?: number | null
  i207Pb206PbTotalUncertainty?: number | null
  i208Pb232ThTotal?: number | null
  i208Pb232ThTotalUncertainty?: number | null
  i208Pb206PbTotal?: number | null
  i208Pb206PbTotalUncertainty?: number | null
  i204Pb206PbTotal?: number | null
  i204Pb206PbTotalUncertainty?: number | null
  i232Th238U?: number | null
  i207Pb235UCommPbCorr?: number | null
  i207Pb235UCommPbCorrUncertainty?: number | null
  i206Pb238UCommPbCorr?: number | null
  i206Pb238UCommPbCorrUncertainty?: number | null
  i238U206PbCommPbCorr?: number | null
  i238U206PbCommPbCorrUncertainty?: number | null
  i207Pb206PbCommPbCorr?: number | null
  i207Pb206PbCommPbCorrUncertainty?: number | null
  i208Pb232ThCommPbCorr?: number | null
  i208Pb232ThCommPbCorrUncertainty?: number | null
  i208Pb206PbCommPbCorr?: number | null
  i208Pb206PbCommPbCorrUncertainty?: number | null
  i204Pb206PbCommPbCorr?: number | null
  i204Pb206PbCommPbCorrUncertainty?: number | null
  rho207Pb235U206Pb238Ucorr?: number | null
  rho238U206Pb207Pb206Pbcorr?: number | null
  rho238U206Pb204Pb206Pbcorr?: number | null
  rho207Pb206Pb204Pb206Pbcorr?: number | null
  i207Pb235U208Corr?: number | null
  i207Pb235U208CorrUncertainty?: number | null
  i206Pb238U208Corr?: number | null
  i206Pb238U208CorrUncertainty?: number | null
  i238U206Pb208Corr?: number | null
  i238U206Pb208CorrUncertainty?: number | null
  i207Pb206Pb208Corr?: number | null
  i207Pb206Pb208CorrUncertainty?: number | null
  rho207Pb235U206Pb238Ucorr208Pb?: number | null
}

type Num = number | null | undefined
type Ratio = { value: number; err: number }

/** Preference for which LithoSurfer ratio family to read. */
export type UPbRatioSource = 'auto' | 'commPb' | 'total' | 'corr208'

export type UPbIsoplotROptions = {
  /** IsoplotR U-Pb format number. Omit / undefined = auto-pick. */
  format?: number
  ratioSource?: UPbRatioSource
  /** Override plot device; defaults from the format. */
  plotdevice?: 'concordia' | 'isochron'
}

export type UPbFormatOption = {
  format: number
  plotdevice: 'concordia' | 'isochron'
  label: string
  shortLabel: string
  usableSpots: number
  richness: number
}

type MappedSpot = {
  columns: Record<string, number | null>
  data4row: Array<number | string>
  comment: string
}

type FormatCandidate = {
  format: number
  plotdevice: 'concordia' | 'isochron'
  richness: number
  label: string
  shortLabel: string
  trySpot: (spot: UPbSpotRow, r: RatioAccessors) => Omit<MappedSpot, 'comment'> | null
}

type RatioAccessors = {
  u238pb206: (spot: UPbSpotRow) => Ratio | null
  pb206u238: (spot: UPbSpotRow) => Ratio | null
  pb207u235: (spot: UPbSpotRow) => Ratio | null
  pb207pb206: (spot: UPbSpotRow) => Ratio | null
  pb208th232: (spot: UPbSpotRow) => Ratio | null
  pb208pb206: (spot: UPbSpotRow) => Ratio | null
  pb204pb206: (spot: UPbSpotRow) => Ratio | null
  th232u238: (spot: UPbSpotRow) => Ratio | null
  rhoWetherill: (spot: UPbSpotRow) => number | null
  rhoTW: (spot: UPbSpotRow) => number | null
}

function cloneTemplate(): IsoplotRSession {
  return JSON.parse(JSON.stringify(sessionTemplate)) as IsoplotRSession
}

function spotComment(spot: UPbSpotRow): string {
  const parts = [spot.aliquotName, spot.spotID, spot.id != null ? `id:${spot.id}` : null].filter(Boolean)
  return parts.join(' / ') || ''
}

function ratio(value: Num, err: Num): Ratio | null {
  if (value == null || err == null || !Number.isFinite(value) || !Number.isFinite(err)) return null
  return { value, err }
}

function firstRatio(...candidates: Array<[Num, Num]>): Ratio | null {
  for (const [v, e] of candidates) {
    const r = ratio(v, e)
    if (r) return r
  }
  return null
}

function invertRatio(r: Ratio): Ratio | null {
  if (r.value === 0) return null
  return { value: 1 / r.value, err: Math.abs(r.err / (r.value * r.value)) }
}

function createRatioAccessors(source: UPbRatioSource): RatioAccessors {
  const pb207u235 = (spot: UPbSpotRow) => {
    if (source === 'commPb') return ratio(spot.i207Pb235UCommPbCorr, spot.i207Pb235UCommPbCorrUncertainty)
    if (source === 'total') return ratio(spot.i207Pb235UTotal, spot.i207Pb235UTotalUncertainty)
    if (source === 'corr208') return ratio(spot.i207Pb235U208Corr, spot.i207Pb235U208CorrUncertainty)
    return firstRatio(
      [spot.i207Pb235UCommPbCorr, spot.i207Pb235UCommPbCorrUncertainty],
      [spot.i207Pb235UTotal, spot.i207Pb235UTotalUncertainty],
      [spot.i207Pb235U208Corr, spot.i207Pb235U208CorrUncertainty],
    )
  }

  const pb206u238Direct = (spot: UPbSpotRow) => {
    if (source === 'commPb') return ratio(spot.i206Pb238UCommPbCorr, spot.i206Pb238UCommPbCorrUncertainty)
    if (source === 'total') return ratio(spot.i206Pb238UTotal, spot.i206Pb238UTotalUncertainty)
    if (source === 'corr208') return ratio(spot.i206Pb238U208Corr, spot.i206Pb238U208CorrUncertainty)
    return firstRatio(
      [spot.i206Pb238UCommPbCorr, spot.i206Pb238UCommPbCorrUncertainty],
      [spot.i206Pb238UTotal, spot.i206Pb238UTotalUncertainty],
      [spot.i206Pb238U208Corr, spot.i206Pb238U208CorrUncertainty],
    )
  }

  const u238pb206Direct = (spot: UPbSpotRow) => {
    if (source === 'commPb') return ratio(spot.i238U206PbCommPbCorr, spot.i238U206PbCommPbCorrUncertainty)
    if (source === 'total') return ratio(spot.i238U206PbTotal, spot.i238U206PbTotalUncertainty)
    if (source === 'corr208') return ratio(spot.i238U206Pb208Corr, spot.i238U206Pb208CorrUncertainty)
    return firstRatio(
      [spot.i238U206PbCommPbCorr, spot.i238U206PbCommPbCorrUncertainty],
      [spot.i238U206PbTotal, spot.i238U206PbTotalUncertainty],
      [spot.i238U206Pb208Corr, spot.i238U206Pb208CorrUncertainty],
    )
  }

  const pb207pb206 = (spot: UPbSpotRow) => {
    if (source === 'commPb') return ratio(spot.i207Pb206PbCommPbCorr, spot.i207Pb206PbCommPbCorrUncertainty)
    if (source === 'total') return ratio(spot.i207Pb206PbTotal, spot.i207Pb206PbTotalUncertainty)
    if (source === 'corr208') return ratio(spot.i207Pb206Pb208Corr, spot.i207Pb206Pb208CorrUncertainty)
    return firstRatio(
      [spot.i207Pb206PbCommPbCorr, spot.i207Pb206PbCommPbCorrUncertainty],
      [spot.i207Pb206PbTotal, spot.i207Pb206PbTotalUncertainty],
      [spot.i207Pb206Pb208Corr, spot.i207Pb206Pb208CorrUncertainty],
    )
  }

  const pb208pb206 = (spot: UPbSpotRow) => {
    if (source === 'commPb') return ratio(spot.i208Pb206PbCommPbCorr, spot.i208Pb206PbCommPbCorrUncertainty)
    if (source === 'total') return ratio(spot.i208Pb206PbTotal, spot.i208Pb206PbTotalUncertainty)
    if (source === 'corr208') return null
    return firstRatio(
      [spot.i208Pb206PbCommPbCorr, spot.i208Pb206PbCommPbCorrUncertainty],
      [spot.i208Pb206PbTotal, spot.i208Pb206PbTotalUncertainty],
    )
  }

  const pb204pb206 = (spot: UPbSpotRow) => {
    if (source === 'commPb') return ratio(spot.i204Pb206PbCommPbCorr, spot.i204Pb206PbCommPbCorrUncertainty)
    if (source === 'total') return ratio(spot.i204Pb206PbTotal, spot.i204Pb206PbTotalUncertainty)
    if (source === 'corr208') return null
    return firstRatio(
      [spot.i204Pb206PbCommPbCorr, spot.i204Pb206PbCommPbCorrUncertainty],
      [spot.i204Pb206PbTotal, spot.i204Pb206PbTotalUncertainty],
    )
  }

  const pb208th232 = (spot: UPbSpotRow) => {
    if (source === 'commPb') return ratio(spot.i208Pb232ThCommPbCorr, spot.i208Pb232ThCommPbCorrUncertainty)
    if (source === 'total') return ratio(spot.i208Pb232ThTotal, spot.i208Pb232ThTotalUncertainty)
    if (source === 'corr208') return null
    return firstRatio(
      [spot.i208Pb232ThCommPbCorr, spot.i208Pb232ThCommPbCorrUncertainty],
      [spot.i208Pb232ThTotal, spot.i208Pb232ThTotalUncertainty],
    )
  }

  return {
    pb207u235,
    pb207pb206,
    pb208pb206,
    pb204pb206,
    pb208th232,
    pb206u238(spot) {
      return pb206u238Direct(spot) ?? (() => {
        const inv = u238pb206Direct(spot)
        return inv ? invertRatio(inv) : null
      })()
    },
    u238pb206(spot) {
      return u238pb206Direct(spot) ?? (() => {
        const inv = pb206u238Direct(spot)
        return inv ? invertRatio(inv) : null
      })()
    },
    th232u238(spot) {
      if (spot.i232Th238U == null || !Number.isFinite(spot.i232Th238U)) return null
      return { value: spot.i232Th238U, err: 0 }
    },
    rhoWetherill(spot) {
      if (source === 'corr208') return spot.rho207Pb235U206Pb238Ucorr208Pb ?? null
      if (source === 'total') return null
      return spot.rho207Pb235U206Pb238Ucorr ?? spot.rho207Pb235U206Pb238Ucorr208Pb ?? null
    },
    rhoTW(spot) {
      if (source === 'total' || source === 'corr208') return null
      return spot.rho238U206Pb207Pb206Pbcorr ?? null
    },
  }
}

const FORMAT_CANDIDATES: FormatCandidate[] = [
  {
    format: 3,
    plotdevice: 'concordia',
    richness: 50,
    label: 'Wetherill + 207/206 (format 3)',
    shortLabel: 'Wetherill + 207/206',
    trySpot(spot, r) {
      const x = r.pb207u235(spot)
      const y = r.pb206u238(spot)
      const z = r.pb207pb206(spot)
      if (!x || !y || !z) return null
      const rXY = r.rhoWetherill(spot)
      return {
        columns: {
          'X=07/35': x.value,
          'err[X]': x.err,
          'Y=06/38': y.value,
          'err[Y]': y.err,
          'Z=07/06': z.value,
          'err[Z]': z.err,
          '(rXY)': rXY,
          '(rYZ)': null,
        },
        data4row: [x.value, x.err, y.value, y.err, z.value, z.err, rXY ?? '', ''],
      }
    },
  },
  {
    format: 1,
    plotdevice: 'concordia',
    richness: 40,
    label: 'Wetherill 07/35–06/38 (format 1)',
    shortLabel: 'Wetherill',
    trySpot(spot, r) {
      const x = r.pb207u235(spot)
      const y = r.pb206u238(spot)
      if (!x || !y) return null
      const rXY = r.rhoWetherill(spot)
      return {
        columns: {
          'X=07/35': x.value,
          'err[X]': x.err,
          'Y=06/38': y.value,
          'err[Y]': y.err,
          rXY,
        },
        data4row: [x.value, x.err, y.value, y.err, rXY ?? '', '', '', ''],
      }
    },
  },
  {
    format: 8,
    plotdevice: 'concordia',
    richness: 35,
    label: 'Tera–Wasserburg + 208/06 (format 8)',
    shortLabel: 'T–W + 208/06',
    trySpot(spot, r) {
      const w = r.u238pb206(spot)
      const x = r.pb207pb206(spot)
      const y = r.pb208pb206(spot)
      if (!w || !x || !y) return null
      const z = r.th232u238(spot)
      return {
        columns: {
          'W=38/06': w.value,
          'err[W]': w.err,
          'X=07/06': x.value,
          'err[X]': x.err,
          'Y=08/06': y.value,
          'err[Y]': y.err,
          '(Z=32/38)': z?.value ?? null,
          '(err[Z])': z != null ? z.err : null,
          '(rWX)': r.rhoTW(spot),
          '(rWY)': null,
          '(rWZ)': null,
          '(rXY)': null,
          '(rXZ)': null,
          '(rYZ)': null,
        },
        data4row: [
          w.value, w.err, x.value, x.err, y.value, y.err,
          z?.value ?? '', z != null ? z.err : '', r.rhoTW(spot) ?? '', '', '', '', '', '',
        ],
      }
    },
  },
  {
    format: 2,
    plotdevice: 'concordia',
    richness: 30,
    label: 'Tera–Wasserburg 38/06–07/06 (format 2)',
    shortLabel: 'Tera–Wasserburg',
    trySpot(spot, r) {
      const x = r.u238pb206(spot)
      const y = r.pb207pb206(spot)
      if (!x || !y) return null
      const rXY = r.rhoTW(spot)
      return {
        columns: {
          'X=38/06': x.value,
          'err[X]': x.err,
          'Y=07/06': y.value,
          'err[Y]': y.err,
          '(rXY)': rXY,
        },
        data4row: [x.value, x.err, y.value, y.err, rXY ?? '', '', '', ''],
      }
    },
  },
  {
    format: 7,
    plotdevice: 'concordia',
    richness: 25,
    label: 'Wetherill + Th (format 7)',
    shortLabel: 'Wetherill + Th',
    trySpot(spot, r) {
      const w = r.pb207u235(spot)
      const x = r.pb206u238(spot)
      const y = r.pb208th232(spot)
      const z = r.th232u238(spot)
      if (!w || !x || !y || !z) return null
      const rWX = r.rhoWetherill(spot)
      return {
        columns: {
          'W=07/35': w.value,
          'err[W]': w.err,
          'X=06/38': x.value,
          'err[X]': x.err,
          'Y=08/32': y.value,
          'err[Y]': y.err,
          'Z=32/38': z.value,
          '(err[Z])': z.err,
          '(rWX)': rWX,
          '(rWY)': null,
          '(rWZ)': null,
          '(rXY)': null,
          '(rXZ)': null,
          '(rYZ)': null,
        },
        data4row: [
          w.value, w.err, x.value, x.err, y.value, y.err, z.value, z.err,
          rWX ?? '', '', '', '', '', '',
        ],
      }
    },
  },
  {
    format: 5,
    plotdevice: 'concordia',
    richness: 20,
    label: 'Tera–Wasserburg + 204/06 (format 5)',
    shortLabel: 'T–W + 204/06',
    trySpot(spot, r) {
      const x = r.u238pb206(spot)
      const y = r.pb207pb206(spot)
      const z = r.pb204pb206(spot)
      if (!x || !y || !z) return null
      return {
        columns: {
          'X=38/06': x.value,
          'err[X]': x.err,
          'Y=07/06': y.value,
          'err[Y]': y.err,
          'Z=04/06': z.value,
          'err[Z]': z.err,
          rXY: r.rhoTW(spot),
          rXZ: spot.rho238U206Pb204Pb206Pbcorr ?? null,
          rYZ: spot.rho207Pb206Pb204Pb206Pbcorr ?? null,
        },
        data4row: [
          x.value, x.err, y.value, y.err, z.value, z.err,
          r.rhoTW(spot) ?? '', spot.rho238U206Pb204Pb206Pbcorr ?? '', spot.rho207Pb206Pb204Pb206Pbcorr ?? '',
        ],
      }
    },
  },
  {
    format: 11,
    plotdevice: 'concordia',
    richness: 15,
    label: '38/06–08/06 (format 11)',
    shortLabel: '38/06–08/06',
    trySpot(spot, r) {
      const x = r.u238pb206(spot)
      const y = r.pb208pb206(spot)
      if (!x || !y) return null
      const z = r.th232u238(spot)
      return {
        columns: {
          'X=38/06': x.value,
          'err[X]': x.err,
          'Y=08/06': y.value,
          'err[Y]': y.err,
          '(Z=32/38)': z?.value ?? null,
          '(err[Z])': z != null ? z.err : null,
          '(rXY)': null,
          '(rXZ)': null,
          '(rYZ)': null,
        },
        data4row: [
          x.value, x.err, y.value, y.err,
          z?.value ?? '', z != null ? z.err : '', '', '', '',
        ],
      }
    },
  },
  {
    format: 9,
    plotdevice: 'isochron',
    richness: 10,
    label: '38/06–04/06 isochron (format 9)',
    shortLabel: '38/06–04/06 isochron',
    trySpot(spot, r) {
      const x = r.u238pb206(spot)
      const y = r.pb204pb206(spot)
      if (!x || !y) return null
      return {
        columns: {
          'X=38/06': x.value,
          'err[X]': x.err,
          'Y=04/06': y.value,
          'err[Y]': y.err,
          '(rXY)': spot.rho238U206Pb204Pb206Pbcorr ?? null,
        },
        data4row: [x.value, x.err, y.value, y.err, spot.rho238U206Pb204Pb206Pbcorr ?? '', '', '', ''],
      }
    },
  },
]

function mapCandidateRows(
  candidate: FormatCandidate,
  spots: UPbSpotRow[],
  accessors: RatioAccessors,
): MappedSpot[] {
  const rows: MappedSpot[] = []
  for (const spot of spots) {
    const mapped = candidate.trySpot(spot, accessors)
    if (!mapped) continue
    rows.push({ ...mapped, comment: spotComment(spot) })
  }
  return rows
}

function pickBestFormat(
  spots: UPbSpotRow[],
  accessors: RatioAccessors,
): { candidate: FormatCandidate; rows: MappedSpot[] } {
  let best: { candidate: FormatCandidate; rows: MappedSpot[] } | null = null
  for (const candidate of FORMAT_CANDIDATES) {
    const rows = mapCandidateRows(candidate, spots, accessors)
    if (rows.length === 0) continue
    if (
      !best ||
      rows.length > best.rows.length ||
      (rows.length === best.rows.length && candidate.richness > best.candidate.richness)
    ) {
      best = { candidate, rows }
    }
  }
  if (!best) {
    throw new Error(
      'No U-Pb spots could be mapped to an IsoplotR format. Need ratio pairs such as ' +
        '07/35+06/38, 38/06+07/06, or 38/06+04/06 (common-Pb-corrected, total, or 208-corrected).',
    )
  }
  return best
}

/** Formats that have at least one usable spot for the given ratio source. */
export function listUPbFormatOptions(
  spots: UPbSpotRow[],
  ratioSource: UPbRatioSource = 'auto',
): UPbFormatOption[] {
  const accessors = createRatioAccessors(ratioSource)
  return FORMAT_CANDIDATES.map((candidate) => ({
    format: candidate.format,
    plotdevice: candidate.plotdevice,
    label: candidate.label,
    shortLabel: candidate.shortLabel,
    usableSpots: mapCandidateRows(candidate, spots, accessors).length,
    richness: candidate.richness,
  }))
    .filter((o) => o.usableSpots > 0)
    .sort((a, b) => b.usableSpots - a.usableSpots || b.richness - a.richness)
}

export function getDefaultUPbFormat(
  spots: UPbSpotRow[],
  ratioSource: UPbRatioSource = 'auto',
): number | undefined {
  return listUPbFormatOptions(spots, ratioSource)[0]?.format
}

function sessionFromRows(
  candidate: FormatCandidate,
  rows: MappedSpot[],
  plotdevice?: 'concordia' | 'isochron',
): IsoplotRSession {
  const n = rows.length
  const nulls = rows.map(() => null)
  const comments = rows.map((r) => r.comment)
  const columnNames = Object.keys(rows[0].columns)
  const dataColumns: Record<string, Array<number | string | null>> = {}
  for (const name of columnNames) {
    dataColumns[name] = rows.map((r) => r.columns[name] ?? null)
  }
  dataColumns['(C)'] = nulls
  dataColumns['(omit)'] = nulls
  dataColumns['(comment)'] = comments

  const session = cloneTemplate()
  const settings = session.settings as Record<string, unknown>
  settings.geochronometer = 'U-Pb'
  settings.plotdevice = plotdevice ?? candidate.plotdevice
  ;(settings['U-Pb'] as Record<string, unknown>).format = candidate.format

  const dataRoot = session.data as Record<string, unknown>
  dataRoot['U-Pb'] = { ierr: 1, data: dataColumns }
  dataRoot['Ar-Ar'] = {}

  const nc = Math.max(...rows.map((r) => r.data4row.length), 8)
  session.data4server = {
    nr: n,
    nc,
    data: rows.map((r) => {
      const padded = [...r.data4row]
      while (padded.length < nc) padded.push('')
      if (padded.length >= 8) padded[padded.length - 1] = r.comment
      return padded
    }),
  }

  try {
    console.info(`[IsoplotR] U-Pb ${candidate.label}: ${n} spot(s)`)
  } catch {
    /* ignore */
  }

  return session
}

/**
 * Build an IsoplotRgui U-Pb session.
 * With no options, auto-selects the richest format / ratio fallbacks.
 */
export function buildUPbIsoplotRSession(
  spots: UPbSpotRow[],
  options: UPbIsoplotROptions = {},
): IsoplotRSession {
  const ratioSource = options.ratioSource ?? 'auto'
  const accessors = createRatioAccessors(ratioSource)

  if (options.format != null) {
    const candidate = FORMAT_CANDIDATES.find((c) => c.format === options.format)
    if (!candidate) throw new Error(`Unsupported IsoplotR U-Pb format ${options.format}.`)
    const rows = mapCandidateRows(candidate, spots, accessors)
    if (rows.length === 0) {
      throw new Error(
        `No spots match ${candidate.label} with the selected ratio source.`,
      )
    }
    return sessionFromRows(candidate, rows, options.plotdevice)
  }

  const { candidate, rows } = pickBestFormat(spots, accessors)
  return sessionFromRows(candidate, rows, options.plotdevice)
}

export function describeUPbIsoplotRMapping(
  spots: UPbSpotRow[],
  options: UPbIsoplotROptions = {},
): string {
  const ratioSource = options.ratioSource ?? 'auto'
  const accessors = createRatioAccessors(ratioSource)
  if (options.format != null) {
    const candidate = FORMAT_CANDIDATES.find((c) => c.format === options.format)
    if (!candidate) return `format ${options.format}`
    const rows = mapCandidateRows(candidate, spots, accessors)
    return `${candidate.label} — ${rows.length} of ${spots.length} spot(s)`
  }
  const { candidate, rows } = pickBestFormat(spots, accessors)
  return `${candidate.label} — ${rows.length} of ${spots.length} spot(s)`
}
