/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

VYATTA_operationObject = Ext.extend(VYATTA_panels,
{
    ////////////////////////////////////////////////////////////////////////////
    constructor: function(parentContainer, name)
    {
        this.m_parentContainer = parentContainer;
        this.m_name = name;
    },

    f_initDataType: function()
    {
        this.f_initPanelDataType(this.m_parentContainer, this.m_name);
    }
});
