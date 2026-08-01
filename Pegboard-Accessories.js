FeatureScript 686;
import(path : "onshape/std/geometry.fs", version : "686.0");
import(path : "onshape/std/sheetMetalUtils.fs", version : "686.0");

/* ============================================================
   Pegboard Tool Holder
   For US-standard pegboard: 1/4" holes on 1" centers.

   Local build frame (before optional mate connector placement):
     +X = right across the board
     +Y = up
     +Z = out of the board face (toward you)
     Z = 0 is the FRONT SURFACE of the pegboard.

   Hooks follow the standard commercial shape: shaft swept
   slightly upward with an upturned tip so tools can't slide off.
   ============================================================ */

export enum HolderStyle
{
    annotation { "Name" : "Backplate only" }
    NONE,
    annotation { "Name" : "Hook (upswept)" }
    HOOK,
    annotation { "Name" : "Double prong (pliers, cutters)" }
    DOUBLE,
    annotation { "Name" : "Shelf" }
    SHELF,
    annotation { "Name" : "Ring rack" }
    RINGS,
    annotation { "Name" : "Can rack (spray paint, bottles)" }
    CANS,
    annotation { "Name" : "Slot rack" }
    SLOTS
}

export enum PegStyle
{
    annotation { "Name" : "Straight (friction fit)" }
    STRAIGHT,
    annotation { "Name" : "Hooked (top row locks in)" }
    HOOKED
}

const GRID_BOUNDS = { (unitless) : [1, 2, 40] } as IntegerBoundSpec;
const RING_BOUNDS = { (unitless) : [1, 3, 40] } as IntegerBoundSpec;

const PITCH_BOUNDS =
{
    (meter)      : [0.005, 0.0254, 0.5],
    (millimeter) : 25.4,
    (inch)       : 1.0
} as LengthBoundSpec;

const PEG_BOUNDS =
{
    (meter)      : [0.0005, 0.005969, 0.05],
    (millimeter) : 5.969,
    (inch)       : 0.235
} as LengthBoundSpec;

const BOARD_BOUNDS =
{
    (meter)      : [0.0005, 0.00635, 0.05],
    (millimeter) : 6.35,
    (inch)       : 0.25
} as LengthBoundSpec;

const PLATE_BOUNDS =
{
    (meter)      : [0.0005, 0.004, 0.05],
    (millimeter) : 4.0,
    (inch)       : 0.16
} as LengthBoundSpec;

const MARGIN_BOUNDS =
{
    (meter)      : [0.0, 0.008, 0.2],
    (millimeter) : 8.0,
    (inch)       : 0.3
} as LengthBoundSpec;

const LIP_T_BOUNDS =
{
    (meter)      : [0.0005, 0.002, 0.02],
    (millimeter) : 2.0,
    (inch)       : 0.08
} as LengthBoundSpec;

const LIP_D_BOUNDS =
{
    (meter)      : [0.0005, 0.003, 0.03],
    (millimeter) : 3.0,
    (inch)       : 0.12
} as LengthBoundSpec;

const OUT_BOUNDS =
{
    (meter)      : [0.001, 0.03, 0.5],
    (millimeter) : 30.0,
    (inch)       : 1.2
} as LengthBoundSpec;

const ROD_BOUNDS =
{
    (meter)      : [0.0005, 0.005, 0.05],
    (millimeter) : 5.0,
    (inch)       : 0.2
} as LengthBoundSpec;

const ANGLE_BOUNDS =
{
    (degree) : [0, 10, 45]
} as AngleBoundSpec;

const PRONG_BOUNDS =
{
    (meter)      : [0.002, 0.018, 0.3],
    (millimeter) : 18.0,
    (inch)       : 0.7
} as LengthBoundSpec;

const RING_R_BOUNDS =
{
    (meter)      : [0.0005, 0.01, 0.2],
    (millimeter) : 10.0,
    (inch)       : 0.4
} as LengthBoundSpec;

const CAN_DIA_BOUNDS =
{
    (meter)      : [0.005, 0.07, 0.2],
    (millimeter) : 70.0,
    (inch)       : 2.75
} as LengthBoundSpec;

const CAN_DEPTH_BOUNDS =
{
    (meter)      : [0.01, 0.1, 0.3],
    (millimeter) : 100.0,
    (inch)       : 4.0
} as LengthBoundSpec;

const SLOT_W_BOUNDS =
{
    (meter)      : [0.0005, 0.008, 0.2],
    (millimeter) : 8.0,
    (inch)       : 0.3
} as LengthBoundSpec;

const EDGE_R_BOUNDS =
{
    (meter)      : [0.0001, 0.0008, 0.005],
    (millimeter) : 0.8,
    (inch)       : 0.03
} as LengthBoundSpec;

annotation { "Feature Type Name" : "Pegboard holder" }
export const pegboardHolder = defineFeature(function(context is Context, id is Id, definition is map)
    precondition
    {
        // ---- peg grid ----
        annotation { "Name" : "Holes across" }
        isInteger(definition.cols, GRID_BOUNDS);

        annotation { "Name" : "Holes down" }
        isInteger(definition.rows, GRID_BOUNDS);

        annotation { "Name" : "Hole spacing" }
        isLength(definition.pitch, PITCH_BOUNDS);

        annotation { "Name" : "Peg diameter" }
        isLength(definition.pegDia, PEG_BOUNDS);

        annotation { "Name" : "Board thickness" }
        isLength(definition.boardT, BOARD_BOUNDS);

        annotation { "Name" : "Peg style" }
        definition.pegStyle is PegStyle;

        if (definition.pegStyle == PegStyle.HOOKED)
        {
            annotation { "Name" : "Lip thickness" }
            isLength(definition.lipT, LIP_T_BOUNDS);

            annotation { "Name" : "Lip drop" }
            isLength(definition.lipDrop, LIP_D_BOUNDS);
        }

        // ---- backplate ----
        annotation { "Name" : "Backplate thickness" }
        isLength(definition.plateT, PLATE_BOUNDS);

        annotation { "Name" : "Backplate margin" }
        isLength(definition.margin, MARGIN_BOUNDS);

        // ---- holder ----
        annotation { "Name" : "Holder style" }
        definition.style is HolderStyle;

        if (definition.style == HolderStyle.HOOK ||
            definition.style == HolderStyle.DOUBLE)
        {
            annotation { "Name" : "Hook length out" }
            isLength(definition.hookOut, OUT_BOUNDS);

            annotation { "Name" : "Tip rise" }
            isLength(definition.hookUp, ROD_BOUNDS);

            annotation { "Name" : "Rod diameter" }
            isLength(definition.rodDia, ROD_BOUNDS);

            annotation { "Name" : "Shaft upsweep angle" }
            isAngle(definition.upAngle, ANGLE_BOUNDS);
        }

        if (definition.style == HolderStyle.DOUBLE)
        {
            annotation { "Name" : "Prong spacing" }
            isLength(definition.prongGap, PRONG_BOUNDS);
        }

        if (definition.style == HolderStyle.SHELF ||
            definition.style == HolderStyle.RINGS ||
            definition.style == HolderStyle.SLOTS)
        {
            annotation { "Name" : "Shelf depth" }
            isLength(definition.shelfDepth, OUT_BOUNDS);
        }

        if (definition.style == HolderStyle.SHELF ||
            definition.style == HolderStyle.RINGS ||
            definition.style == HolderStyle.SLOTS ||
            definition.style == HolderStyle.CANS)
        {
            annotation { "Name" : "Shelf thickness" }
            isLength(definition.shelfT, PLATE_BOUNDS);
        }

        if (definition.style == HolderStyle.SHELF)
        {
            annotation { "Name" : "Front lip height" }
            isLength(definition.shelfLip, ROD_BOUNDS);
        }

        if (definition.style == HolderStyle.RINGS)
        {
            annotation { "Name" : "Number of rings" }
            isInteger(definition.ringCount, RING_BOUNDS);

            annotation { "Name" : "Ring radius" }
            isLength(definition.ringR, RING_R_BOUNDS);
        }

        if (definition.style == HolderStyle.CANS)
        {
            annotation { "Name" : "Number of cans" }
            isInteger(definition.canCount, RING_BOUNDS);

            annotation { "Name" : "Can diameter" }
            isLength(definition.canDia, CAN_DIA_BOUNDS);

            annotation { "Name" : "Can rack depth" }
            isLength(definition.canDepth, CAN_DEPTH_BOUNDS);
        }

        if (definition.style == HolderStyle.SLOTS)
        {
            annotation { "Name" : "Number of slots" }
            isInteger(definition.slotCount, RING_BOUNDS);

            annotation { "Name" : "Slot width" }
            isLength(definition.slotW, SLOT_W_BOUNDS);

            annotation { "Name" : "Slot depth" }
            isLength(definition.slotDepth, RING_R_BOUNDS);
        }

        // ---- styling ----
        annotation { "Name" : "Slick styling", "Default" : true }
        definition.slick is boolean;

        if (definition.slick)
        {
            annotation { "Name" : "Edge fillet radius" }
            isLength(definition.edgeR, EDGE_R_BOUNDS);
        }

        // ---- placement ----
        annotation { "Name" : "Place on mate connector" }
        definition.usePlacement is boolean;

        if (definition.usePlacement)
        {
            annotation { "Name" : "Mate connector (Z out of board)",
                         "Filter" : BodyType.MATE_CONNECTOR,
                         "MaxNumberOfPicks" : 1 }
            definition.origin is Query;
        }
    }
    {
        const pitch  = definition.pitch;
        const cols   = definition.cols;
        const rows   = definition.rows;
        const pegR   = definition.pegDia / 2;
        const boardT = definition.boardT;
        const plateT = definition.plateT;

        const gridW = (cols - 1) * pitch;
        const gridH = (rows - 1) * pitch;
        const width  = gridW + 2 * definition.margin;
        const height = gridH + 2 * definition.margin;

        const xL = -width / 2;
        const xR =  width / 2;
        const yB = -height / 2;
        const yT =  height / 2;
        const z0 = 0 * meter;

        const slick = definition.slick;

        // ---------- backplate ----------
        // Slick styling: rounded corners, built as two overlapping
        // cuboids plus four corner cylinders (radius = margin, capped
        // so the cuboids keep positive size on 1-hole grids).
        const cornerR = slick ?
            min(definition.margin, min(0.45 * width, 0.45 * height)) : 0 * meter;

        if (cornerR > 0.2 * millimeter)
        {
            fCuboid(context, id + "plateX", {
                        "corner1" : vector(xL + cornerR, yB, z0),
                        "corner2" : vector(xR - cornerR, yT, plateT)
                    });
            fCuboid(context, id + "plateY", {
                        "corner1" : vector(xL, yB + cornerR, z0),
                        "corner2" : vector(xR, yT - cornerR, plateT)
                    });
            const cornerXs = [xL + cornerR, xR - cornerR];
            const cornerYs = [yB + cornerR, yT - cornerR];
            for (var ci = 0; ci < 2; ci += 1)
            {
                for (var cj = 0; cj < 2; cj += 1)
                {
                    fCylinder(context, id + ("corner" ~ ci ~ "_" ~ cj), {
                                "topCenter"    : vector(cornerXs[ci], cornerYs[cj], plateT),
                                "bottomCenter" : vector(cornerXs[ci], cornerYs[cj], z0),
                                "radius"       : cornerR
                            });
                }
            }
        }
        else
        {
            fCuboid(context, id + "plate", {
                        "corner1" : vector(xL, yB, z0),
                        "corner2" : vector(xR, yT, plateT)
                    });
        }

        // ---------- pegs ----------
        const hooked = definition.pegStyle == PegStyle.HOOKED;
        const lipT = hooked ? definition.lipT : 0 * meter;

        for (var j = 0; j < rows; j += 1)
        {
            const y = -gridH / 2 + j * pitch;
            const isTopRow = (j == rows - 1);
            const useLip = hooked && isTopRow;
            const pegLen = useLip ? boardT + lipT : boardT;

            for (var i = 0; i < cols; i += 1)
            {
                const x = -gridW / 2 + i * pitch;
                const tag = "peg" ~ i ~ "_" ~ j;

                fCylinder(context, id + tag, {
                            "topCenter"    : vector(x, y, z0),
                            "bottomCenter" : vector(x, y, -pegLen),
                            "radius"       : pegR
                        });

                if (useLip)
                {
                    fCuboid(context, id + ("lip" ~ i ~ "_" ~ j), {
                                "corner1" : vector(x - pegR, y - pegR - definition.lipDrop, -boardT - lipT),
                                "corner2" : vector(x + pegR, y, -boardT)
                            });
                }
            }
        }

        // ---------- holder front end ----------
        // Upswept hook: shaft angled upward by upAngle, then an
        // upturned tip so tools can't slide off. Slick styling blends
        // the elbow with a sphere and caps the tip with a ball knob.
        if (definition.style == HolderStyle.HOOK ||
            definition.style == HolderStyle.DOUBLE)
        {
            const rodR = definition.rodDia / 2;
            const yH = yB + 2 * rodR;
            const zEnd = plateT + definition.hookOut;
            const rise = zEnd * tan(definition.upAngle);

            var prongXs = [0 * meter];
            if (definition.style == HolderStyle.DOUBLE)
            {
                prongXs = [-definition.prongGap / 2, definition.prongGap / 2];
            }

            for (var p = 0; p < size(prongXs); p += 1)
            {
                const px = prongXs[p];
                const elbow = vector(px, yH + rise, zEnd);
                const tipTop = elbow + vector(0 * meter, definition.hookUp, 0 * meter);

                fCylinder(context, id + ("shaft" ~ p), {
                            "topCenter"    : elbow,
                            "bottomCenter" : vector(px, yH, z0),
                            "radius"       : rodR
                        });

                fCylinder(context, id + ("tip" ~ p), {
                            "topCenter"    : tipTop,
                            "bottomCenter" : elbow,
                            "radius"       : rodR
                        });

                if (slick)
                {
                    fSphere(context, id + ("elbow" ~ p), {
                                "center" : elbow,
                                "radius" : rodR
                            });
                    fSphere(context, id + ("knob" ~ p), {
                                "center" : tipTop,
                                "radius" : 1.5 * rodR
                            });
                }
            }
        }

        var shelfBuilt = false;
        if (definition.style == HolderStyle.SHELF ||
            definition.style == HolderStyle.RINGS ||
            definition.style == HolderStyle.SLOTS)
        {
            shelfBuilt = true;
            fCuboid(context, id + "shelf", {
                        "corner1" : vector(xL, yB, z0),
                        "corner2" : vector(xR, yB + definition.shelfT, plateT + definition.shelfDepth)
                    });

            if (definition.style == HolderStyle.SHELF)
            {
                fCuboid(context, id + "shelfLip", {
                            "corner1" : vector(xL, yB, plateT + definition.shelfDepth - definition.shelfT),
                            "corner2" : vector(xR, yB + definition.shelfLip, plateT + definition.shelfDepth)
                        });
            }
        }

        // Can rack: solid floor at the bottom, ring band at the top.
        // Cans drop through the band holes and stand on the floor
        // (Wall Control style aerosol holder).
        var canBandBuilt = false;
        if (definition.style == HolderStyle.CANS)
        {
            canBandBuilt = true;
            fCuboid(context, id + "canFloor", {
                        "corner1" : vector(xL, yB, z0),
                        "corner2" : vector(xR, yB + definition.shelfT, plateT + definition.canDepth)
                    });
            fCuboid(context, id + "canBand", {
                        "corner1" : vector(xL, yT - definition.shelfT, z0),
                        "corner2" : vector(xR, yT, plateT + definition.canDepth)
                    });
        }

        // ---------- merge everything solid so far ----------
        opBoolean(context, id + "union", {
                    "tools" : qCreatedBy(id, EntityType.BODY),
                    "operationType" : BooleanOperationType.UNION
                });

        // ---------- cutters ----------
        var cutters = [];
        const eps = 1 * millimeter;

        if (shelfBuilt && definition.style == HolderStyle.RINGS)
        {
            const n = definition.ringCount;
            const step = width / n;
            const zc = plateT + definition.shelfDepth / 2;

            if (definition.ringR * 2 >= step)
            {
                throw regenError("Rings overlap. Reduce ring radius, reduce ring count, or add holes across.");
            }

            for (var i = 0; i < n; i += 1)
            {
                const xc = xL + step * (i + 0.5);
                const cid = id + ("ring" ~ i);
                fCylinder(context, cid, {
                            "topCenter"    : vector(xc, yB + definition.shelfT + eps, zc),
                            "bottomCenter" : vector(xc, yB - eps, zc),
                            "radius"       : definition.ringR
                        });
                cutters = append(cutters, qCreatedBy(cid, EntityType.BODY));
            }
        }

        if (canBandBuilt)
        {
            const n = definition.canCount;
            const step = width / n;
            const canR = definition.canDia / 2;
            const zc = plateT + definition.canDepth / 2;

            if (definition.canDia >= step)
            {
                throw regenError("Cans overlap. Reduce can diameter, reduce can count, or add holes across.");
            }
            if (definition.canDia + 4 * millimeter > definition.canDepth)
            {
                throw regenError("Can diameter must fit within the can rack depth. Increase can rack depth.");
            }

            for (var i = 0; i < n; i += 1)
            {
                const xc = xL + step * (i + 0.5);
                const cid = id + ("can" ~ i);
                fCylinder(context, cid, {
                            "topCenter"    : vector(xc, yT + eps, zc),
                            "bottomCenter" : vector(xc, yT - definition.shelfT - eps, zc),
                            "radius"       : canR
                        });
                cutters = append(cutters, qCreatedBy(cid, EntityType.BODY));
            }
        }

        if (shelfBuilt && definition.style == HolderStyle.SLOTS)
        {
            const n = definition.slotCount;
            const step = width / n;

            if (definition.slotW >= step)
            {
                throw regenError("Slots overlap. Reduce slot width or slot count.");
            }
            if (definition.slotDepth >= definition.shelfDepth)
            {
                throw regenError("Slot depth must be less than shelf depth.");
            }

            for (var i = 0; i < n; i += 1)
            {
                const xc = xL + step * (i + 0.5);
                const cid = id + ("slot" ~ i);
                fCuboid(context, cid, {
                            "corner1" : vector(xc - definition.slotW / 2, yB - eps,
                                               plateT + definition.shelfDepth - definition.slotDepth),
                            "corner2" : vector(xc + definition.slotW / 2, yB + definition.shelfT + eps,
                                               plateT + definition.shelfDepth + eps)
                        });
                cutters = append(cutters, qCreatedBy(cid, EntityType.BODY));
            }
        }

        if (size(cutters) > 0)
        {
            const cutterQ = qUnion(cutters);
            opBoolean(context, id + "cut", {
                        "tools"   : cutterQ,
                        "targets" : qSubtraction(qCreatedBy(id, EntityType.BODY), cutterQ),
                        "operationType" : BooleanOperationType.SUBTRACTION
                    });
        }

        // ---------- slick edge break ----------
        // Best-effort: a small fillet on every edge softens the whole
        // part. try silent so an unfilletable configuration still
        // regenerates cleanly, just without the rounding.
        if (slick)
        {
            try silent
            {
                opFillet(context, id + "smooth", {
                            "entities" : qCreatedBy(id, EntityType.EDGE),
                            "radius"   : definition.edgeR
                        });
            }
        }

        // ---------- placement ----------
        if (definition.usePlacement)
        {
            const cSys = evMateConnector(context, { "mateConnector" : definition.origin });
            opTransform(context, id + "xform", {
                        "bodies" : qCreatedBy(id, EntityType.BODY),
                        "transform" : transform(cSys)
                    });
        }
    });
