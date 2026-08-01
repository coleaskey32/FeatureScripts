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
   ============================================================ */

export enum HolderStyle
{
    annotation { "Name" : "Backplate only" }
    NONE,
    annotation { "Name" : "Hook" }
    HOOK,
    annotation { "Name" : "Shelf" }
    SHELF,
    annotation { "Name" : "Ring rack" }
    RINGS,
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

const RING_R_BOUNDS =
{
    (meter)      : [0.0005, 0.01, 0.2],
    (millimeter) : 10.0,
    (inch)       : 0.4
} as LengthBoundSpec;

const SLOT_W_BOUNDS =
{
    (meter)      : [0.0005, 0.008, 0.2],
    (millimeter) : 8.0,
    (inch)       : 0.3
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

        if (definition.style == HolderStyle.HOOK)
        {
            annotation { "Name" : "Hook length out" }
            isLength(definition.hookOut, OUT_BOUNDS);

            annotation { "Name" : "Hook tip height" }
            isLength(definition.hookUp, ROD_BOUNDS);

            annotation { "Name" : "Rod diameter" }
            isLength(definition.rodDia, ROD_BOUNDS);
        }

        if (definition.style == HolderStyle.SHELF ||
            definition.style == HolderStyle.RINGS ||
            definition.style == HolderStyle.SLOTS)
        {
            annotation { "Name" : "Shelf depth" }
            isLength(definition.shelfDepth, OUT_BOUNDS);

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

        if (definition.style == HolderStyle.SLOTS)
        {
            annotation { "Name" : "Number of slots" }
            isInteger(definition.slotCount, RING_BOUNDS);

            annotation { "Name" : "Slot width" }
            isLength(definition.slotW, SLOT_W_BOUNDS);

            annotation { "Name" : "Slot depth" }
            isLength(definition.slotDepth, RING_R_BOUNDS);
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

        // ---------- backplate ----------
        fCuboid(context, id + "plate", {
                    "corner1" : vector(xL, yB, z0),
                    "corner2" : vector(xR, yT, plateT)
                });

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
        if (definition.style == HolderStyle.HOOK)
        {
            const rodR = definition.rodDia / 2;
            const yH = yB + 2 * rodR;
            const zTip = plateT + definition.hookOut - rodR;

            fCylinder(context, id + "rod", {
                        "topCenter"    : vector(0 * meter, yH, z0),
                        "bottomCenter" : vector(0 * meter, yH, plateT + definition.hookOut),
                        "radius"       : rodR
                    });

            fCylinder(context, id + "tip", {
                        "topCenter"    : vector(0 * meter, yH + definition.hookUp, zTip),
                        "bottomCenter" : vector(0 * meter, yH, zTip),
                        "radius"       : rodR
                    });
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



