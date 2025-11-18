-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_requests ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view their own organization"
    ON organizations FOR SELECT
    USING (id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Admins can update their own organization"
    ON organizations FOR UPDATE
    USING (id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Users policies
CREATE POLICY "Users can view users in their organization"
    ON users FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update themselves"
    ON users FOR UPDATE
    USING (id = auth.uid());

-- Staff policies
CREATE POLICY "Users can view staff in their organization"
    ON staff FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Admins can insert staff"
    ON staff FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can update staff"
    ON staff FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can delete staff"
    ON staff FOR DELETE
    USING (organization_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Shifts policies
CREATE POLICY "Users can view shifts in their organization"
    ON shifts FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Admins can insert shifts"
    ON shifts FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can update shifts"
    ON shifts FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can delete shifts"
    ON shifts FOR DELETE
    USING (organization_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Shift assignments policies
CREATE POLICY "Users can view shift assignments in their organization"
    ON shift_assignments FOR SELECT
    USING (shift_id IN (
        SELECT id FROM shifts WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Admins can insert shift assignments"
    ON shift_assignments FOR INSERT
    WITH CHECK (shift_id IN (
        SELECT id FROM shifts WHERE organization_id IN (
            SELECT organization_id FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    ));

CREATE POLICY "Admins can update shift assignments"
    ON shift_assignments FOR UPDATE
    USING (shift_id IN (
        SELECT id FROM shifts WHERE organization_id IN (
            SELECT organization_id FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    ));

CREATE POLICY "Admins can delete shift assignments"
    ON shift_assignments FOR DELETE
    USING (shift_id IN (
        SELECT id FROM shifts WHERE organization_id IN (
            SELECT organization_id FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    ));

-- Shift requests policies
CREATE POLICY "Users can view shift requests in their organization"
    ON shift_requests FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY "Staff can insert their own shift requests"
    ON shift_requests FOR INSERT
    WITH CHECK (staff_id IN (
        SELECT id FROM staff WHERE user_id = auth.uid()
    ));

CREATE POLICY "Staff can update their own shift requests"
    ON shift_requests FOR UPDATE
    USING (staff_id IN (
        SELECT id FROM staff WHERE user_id = auth.uid()
    ));

CREATE POLICY "Staff can delete their own shift requests"
    ON shift_requests FOR DELETE
    USING (staff_id IN (
        SELECT id FROM staff WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins can update shift request status"
    ON shift_requests FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));
