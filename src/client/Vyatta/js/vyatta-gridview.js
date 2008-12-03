/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


VYATTA_gridview = Ext.extend(Ext.grid.GridView,
{
    doRender: function(cs, rs, ds, startRow, colCount, stripe)
    {
        var buf = VYATTA_gridview.superclass.doRender.apply(this, arguments);

        //////////////////////////////////////////////////
        // mark row dirt on lost focus
        if(rs.length == 1 && buf.indexOf('x-grid3-dirty-cell') >= 0)
        {
            if(rs[0].data.value.length == 0)
            {
                buf = f_replace(buf, 'x-grid3-dirty-cell', '');
                //rs[0].dirty = false;
            }
            else
                buf = f_replace(buf, 'x-grid3-dirty-cell', 'x-grid3-modify-cell');

            rs[0].error = null;
            this.m_row = startRow;
        }

        return buf;
    }
});

function f_setGridViewError(inputField)
{
    var gv = inputField.getView();
    var r = gv.m_row;
    var row = gv.getRow(r);
    var rec = inputField.getStore().getAt(r);
    var html = row.innerHTML;

    rec.error = true;
    row.innerHTML = f_replace(html , 'x-grid3-modify-cell', 'x-grid3-error-cell');
}